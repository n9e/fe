import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import _ from 'lodash';
import moment from 'moment';

import { useGlobalState } from '@/pages/dashboard/globalState';

import { IVariable as Variable, VariableExecutionMeta, DependencyGraph } from './types';

let nextVariableExecutionSessionId = 0;

export function extractDependencies(str: string, validVars?: Set<string>): string[] {
  // 正则表达式匹配$变量名格式
  // 匹配规则：
  // - 支持 $var 格式：$ 符号后跟一个或多个字母、数字、下划线
  // - 支持 ${var} 格式：$ 符号后跟大括号，内部为一个或多个字母、数字、下划线
  // - 支持 [[var]]，与变量插值支持的语法一致
  const regex = /\$\{([a-zA-Z0-9_]+)\}|\$([a-zA-Z0-9_]+)|\[\[([a-zA-Z0-9_]+)\]\]/g;
  let match;
  const dependencies = new Set<string>();

  while ((match = regex.exec(str)) !== null) {
    // 三个捕获组分别对应 ${var}、$var 和 [[var]]
    const varName = match[1] || match[2] || match[3];
    if (varName) {
      if (validVars && !validVars.has(varName)) {
        continue;
      }
      dependencies.add(varName);
    }
  }

  return Array.from(dependencies);
}

// 生成稳定的 JSON 字符串，确保相同的对象产生相同的字符串
function stringifyStable(obj: unknown): string {
  if (obj === null || obj === undefined) return String(obj);
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(stringifyStable).join(',') + ']';
  }
  // 对对象的键进行排序，确保一致的输出
  const record = obj as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return '{' + keys.map((k) => `"${k}":${stringifyStable(record[k])}`).join(',') + '}';
}

// 变量的配置签名，排除 label、value、options、hide 这些不影响执行逻辑的字段
function getVariableSignature(variable: Variable): string {
  const { label, value, options, hide, ...rest } = variable;
  return stringifyStable(rest);
}

// 递归扫描 query 树收集变量引用。
// variable.query 来源于可序列化的表单配置，不含循环引用，故不设 visited 防护。
function collectDependenciesFromValue(value: unknown, validVarNames: Set<string> | undefined, dependencySet: Set<string>) {
  if (typeof value === 'string') {
    extractDependencies(value, validVarNames).forEach((dep) => dependencySet.add(dep));
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectDependenciesFromValue(item, validVarNames, dependencySet));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectDependenciesFromValue(item, validVarNames, dependencySet));
  }
}

// 分析单个变量引用了哪些其他变量，只有 query 类型的变量需要参与依赖求值
export function collectVariableDependencies(variable: Variable, validVarNames?: Set<string>): string[] {
  if (variable.type !== 'query') {
    return [];
  }

  const dependencySet = new Set<string>();

  // 分析 definition 中的依赖
  if (variable.definition) {
    extractDependencies(variable.definition, validVarNames).forEach((dep) => dependencySet.add(dep));
  } else if (variable.query?.query) {
    const variableQuery = variable.query.query;
    if (typeof variableQuery === 'string') {
      extractDependencies(variableQuery, validVarNames).forEach((dep) => dependencySet.add(dep));
    }
  }

  // 分析 datasource.value 中的依赖
  if (variable.datasource?.value && typeof variable.datasource.value === 'string') {
    extractDependencies(variable.datasource.value, validVarNames).forEach((dep) => dependencySet.add(dep));
  }

  // 扫描完整 query 树。除顶层字段外，GCM 等数据源还会在 filters、group_bys 等嵌套结构中保存变量引用。
  collectDependenciesFromValue(variable.query, validVarNames, dependencySet);

  // 自引用不构成依赖，否则会被拓扑排序判定为循环依赖
  dependencySet.delete(variable.name);

  return Array.from(dependencySet);
}

// 基于完整变量列表重建依赖关系图，结果只与变量配置有关，与组件注册顺序无关
export function buildDependencyGraph(variables: Variable[]): { graph: DependencyGraph; dependenciesByName: Record<string, string[]> } {
  const validVarNames = new Set(variables.map((v) => v.name));
  const graph: DependencyGraph = {};
  const dependenciesByName: Record<string, string[]> = {};

  variables.forEach((variable) => {
    const dependencies = collectVariableDependencies(variable, validVarNames);
    dependenciesByName[variable.name] = dependencies;
    dependencies.forEach((dep) => {
      if (!graph[dep]) graph[dep] = [];
      if (!graph[dep].includes(variable.name)) {
        graph[dep].push(variable.name);
      }
    });
  });

  return { graph, dependenciesByName };
}

// 沿依赖图向下游展开，得到需要跟随变化一起重新执行的变量集合
function collectWithDownstream(names: string[], graph: DependencyGraph): string[] {
  const result = new Set<string>();
  const queue = [...names];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (result.has(current)) continue;
    result.add(current);
    (graph[current] || []).forEach((next) => {
      if (!result.has(next)) queue.push(next);
    });
  }

  return Array.from(result);
}

interface VariableManagerContextType {
  getVariables: () => Variable[];
  updateVariable: (name: string, partial: Partial<Variable>) => void;
  registerVariable: (meta: Omit<VariableExecutionMeta, 'dependencies'> & { variable: Variable }) => void;
  subscribeToVariable: (variableName: string, callback: () => void) => () => void;
  registeredVariables: React.MutableRefObject<Map<string, VariableExecutionMeta>>;
}

const VariableManagerContext = createContext<VariableManagerContextType | undefined>(undefined);

function sortNodesByDependencies(nodes: string[], dependencyGraph: DependencyGraph, getDependencies: (node: string) => string[]) {
  if (nodes.length === 0) {
    return [];
  }

  const inDegree: Record<string, number> = {};
  const queue: string[] = [];
  const result: string[] = [];

  nodes.forEach((node) => {
    inDegree[node] = getDependencies(node).filter((dep) => nodes.includes(dep)).length;
  });

  nodes.forEach((node) => {
    if (inDegree[node] === 0) {
      queue.push(node);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    (dependencyGraph[current] || []).forEach((dep) => {
      if (nodes.includes(dep)) {
        inDegree[dep]--;
        if (inDegree[dep] === 0) {
          queue.push(dep);
        }
      }
    });
  }

  if (result.length !== nodes.length) {
    const cycleNodes = nodes.filter((node) => !result.includes(node));
    throw new Error(`循环依赖检测: ${cycleNodes.join(', ')}`);
  }

  return result;
}

export function getQueryVariableExecutionOrderForRangeChange(
  variables: Variable[],
  registeredVariables: Map<string, Pick<VariableExecutionMeta, 'dependencies'>>,
  dependencyGraph: DependencyGraph,
) {
  const queryVariableNames = variables
    .filter((variable) => variable.type === 'query')
    .map((variable) => variable.name)
    .filter((name) => registeredVariables.has(name));

  if (queryVariableNames.length === 0) {
    return [];
  }

  return sortNodesByDependencies(queryVariableNames, dependencyGraph, (node) => registeredVariables.get(node)?.dependencies || []);
}

export const useVariableManager = () => {
  const context = useContext(VariableManagerContext);
  if (!context) {
    throw new Error('useVariableManager must be used within a VariableManagerProvider');
  }
  return context;
};

export const VariableManagerProvider = ({
  children,
  variables,
  setVariables,
}: {
  children: React.ReactNode;
  variables: Variable[];
  setVariables: (callback: () => void, partial: Partial<Variable>) => void;
}) => {
  // 注册的变量执行元数据
  const registeredVariables = useRef<Map<string, VariableExecutionMeta>>(new Map());
  const [range] = useGlobalState('range');
  const [, setVariableExecution] = useGlobalState('variableExecution');
  // 每次挂载都有独立会话；旧页面的异步链不能改写新页面的执行状态。
  const variableExecutionSessionId = useRef(0);
  if (variableExecutionSessionId.current === 0) {
    variableExecutionSessionId.current = ++nextVariableExecutionSessionId;
  }
  const isMounted = useRef(true);
  // 变量值的同步副本，用于在依赖链执行中获取最新值
  const variablesRef = useRef<Variable[]>(variables);
  // Ensure ref is synced with props during render to be available for children's effects
  if (variables !== variablesRef.current) {
    variablesRef.current = variables;
  }
  // 依赖关系图
  const dependencyGraph = useRef<DependencyGraph>({});
  // 每个变量依赖的变量名，与 dependencyGraph 一同由 reconcile 集中重建
  const dependenciesByName = useRef<Record<string, string[]>>({});
  // 订阅者映射：key为变量名，value为订阅该变量变化的回调函数列表
  const subscribers = useRef<Map<string, Set<() => void>>>(new Map());
  // 执行锁：防止递归触发依赖更新
  const executingDependencies = useRef<Set<string>>(new Set());
  // 全局执行锁：标记是否正在执行依赖链
  const isExecutingChain = useRef(false);
  // 执行链可以重叠（例如新 reconcile 取代旧 reconcile），用计数避免旧链结束时提前释放共享锁。
  const executingChainCount = useRef(0);
  // 初始化状态：标记是否已完成初始执行
  const initialized = useRef(false);
  // 上一次 reconcile 时各变量的配置签名，用于定位发生变化的变量
  const previousSignatures = useRef<Map<string, string> | null>(null);
  // reconcile 轮次，用于丢弃上一轮遗留的异步执行
  const reconcileToken = useRef(0);
  const rangeStart = moment.isMoment(range.start) ? range.start.valueOf() : range.start;
  const rangeEnd = moment.isMoment(range.end) ? range.end.valueOf() : range.end;
  const rangeSignature = `${rangeStart}\u0000${rangeEnd}\u0000${range.refreshFlag || ''}`;
  const previousRangeSignature = useRef<string>(rangeSignature);

  useEffect(() => {
    const sessionId = variableExecutionSessionId.current;
    setVariableExecution((previous) => ({
      sessionId,
      isExecuting: false,
      revision: previous.revision + 1,
    }));

    return () => {
      isMounted.current = false;
      setVariableExecution((previous) => {
        if (previous.sessionId !== sessionId) {
          return previous;
        }
        return {
          ...previous,
          isExecuting: false,
          revision: previous.revision + 1,
        };
      });
    };
  }, [setVariableExecution]);

  const beginExecutionChain = useCallback(() => {
    if (!isMounted.current) {
      return;
    }
    executingChainCount.current += 1;
    isExecutingChain.current = true;
    if (executingChainCount.current === 1) {
      setVariableExecution((previous) => {
        if (previous.sessionId !== variableExecutionSessionId.current) {
          return previous;
        }
        return { ...previous, isExecuting: true };
      });
    }
  }, [setVariableExecution]);

  const endExecutionChain = useCallback(() => {
    if (!isMounted.current) {
      return;
    }
    const wasExecuting = executingChainCount.current > 0;
    executingChainCount.current = Math.max(0, executingChainCount.current - 1);
    isExecutingChain.current = executingChainCount.current > 0;
    if (wasExecuting && !isExecutingChain.current) {
      setVariableExecution((previous) => {
        if (previous.sessionId !== variableExecutionSessionId.current) {
          return previous;
        }
        return {
          ...previous,
          isExecuting: false,
          revision: previous.revision + 1,
        };
      });
    }
  }, [setVariableExecution]);

  const getVariables = useCallback(() => {
    // 在依赖链执行期间，返回 ref 中的最新值
    const effectiveVariables = variablesRef.current.length > 0 ? variablesRef.current : variables;
    return isExecutingChain.current ? effectiveVariables : variables;
  }, [variables]);

  // 更新变量值并通知订阅者
  const updateVariable = useCallback(
    (name: string, partial: Partial<Variable>) => {
      // 同步更新 ref 中的值，确保依赖链中立即可用
      const sourceVariables = variablesRef.current.length > 0 ? variablesRef.current : variables;
      variablesRef.current = _.map(sourceVariables, (item) => {
        if (item.name === name) {
          return { ...item, ...partial };
        }
        return item;
      });

      setVariables(
        () => {
          // 只有在非依赖链执行期间才触发订阅回调
          if (!isExecutingChain.current) {
            const variableSubscribers = subscribers.current.get(name);
            if (variableSubscribers) {
              variableSubscribers.forEach((callback) => {
                callback();
              });
            }
          }
        },
        { name, ...partial },
      );
    },
    [setVariables, variables],
  );

  // 订阅变量变化
  const subscribeToVariable = useCallback((variableName: string, callback: () => void) => {
    if (!subscribers.current.has(variableName)) {
      subscribers.current.set(variableName, new Set());
    }
    subscribers.current.get(variableName)!.add(callback);

    // 返回取消订阅的函数
    return () => {
      subscribers.current.get(variableName)?.delete(callback);
    };
  }, []);

  const topologicalSort = useCallback((nodes: string[], graph: DependencyGraph): string[] => {
    return sortNodesByDependencies(nodes, graph, (node) => registeredVariables.current.get(node)?.dependencies || []);
  }, []);

  // 触发依赖更新
  const triggerDependencyUpdate = useCallback(
    async (dependencyName: string) => {
      // 如果当前依赖正在执行，则跳过（防止递归调用）
      if (executingDependencies.current.has(dependencyName)) {
        return;
      }

      const dependentVariables = dependencyGraph.current[dependencyName] || [];

      if (dependentVariables.length === 0) return;

      // 标记为正在执行
      executingDependencies.current.add(dependencyName);
      beginExecutionChain();

      try {
        // 对依赖变量进行拓扑排序，确保执行顺序正确
        const executionOrder = topologicalSort(dependentVariables, dependencyGraph.current);

        // 执行所有依赖变量
        for (const variableName of executionOrder) {
          const meta = registeredVariables.current.get(variableName);
          if (meta) {
            await meta.executor();
          }
        }
      } finally {
        // 执行完成后移除标记
        executingDependencies.current.delete(dependencyName);
        endExecutionChain();
      }
    },
    [beginExecutionChain, endExecutionChain, topologicalSort],
  );

  const refreshQueryVariablesForRangeChange = useCallback(async () => {
    const executionOrder = getQueryVariableExecutionOrderForRangeChange(variables, registeredVariables.current, dependencyGraph.current);

    if (executionOrder.length === 0) {
      return;
    }

    beginExecutionChain();
    try {
      for (const variableName of executionOrder) {
        const meta = registeredVariables.current.get(variableName);
        if (meta) {
          await meta.executor();
        }
      }
    } finally {
      endExecutionChain();
    }
  }, [beginExecutionChain, endExecutionChain, variables]);

  // 按拓扑序依次执行指定变量，执行期间持有执行锁，避免链内的取值变化重复触发依赖更新
  // isStale 用于在变量配置又发生变化时提前中止本轮执行
  const executeVariables = useCallback(
    async (names: string[], isStale?: () => boolean) => {
      const executable = names.filter((name) => registeredVariables.current.has(name));

      if (executable.length === 0) {
        return;
      }

      let executionOrder = executable;
      try {
        executionOrder = topologicalSort(executable, dependencyGraph.current);
      } catch (error) {
        // 存在循环依赖时退化为注册顺序执行，至少保证变量能拿到可选项
        console.error('[VariableManager] 变量依赖排序失败:', error);
      }

      beginExecutionChain();
      try {
        for (const name of executionOrder) {
          if (isStale?.()) break;
          const meta = registeredVariables.current.get(name);
          if (!meta) continue;
          try {
            await meta.executor();
          } catch (error) {
            console.error(`[VariableManager] 执行 ${name} 失败:`, error);
          }
        }
      } finally {
        endExecutionChain();
      }
    },
    [beginExecutionChain, endExecutionChain, topologicalSort],
  );

  // 用最新的依赖图刷新所有已注册变量的依赖与订阅
  // 配置未变化的变量不会重新注册，因此这里必须覆盖全部注册项，否则它们的依赖联动会丢失
  const applyDependencies = useCallback(() => {
    registeredVariables.current.forEach((meta, name) => {
      meta.cleanup?.();

      const dependencies = dependenciesByName.current[name] ?? [];
      const unsubscribers = dependencies.map((dep) => {
        return subscribeToVariable(dep, () => {
          triggerDependencyUpdate(dep);
        });
      });

      meta.dependencies = dependencies;
      meta.cleanup = () => {
        unsubscribers.forEach((unsubscribe) => unsubscribe());
      };
    });
  }, [subscribeToVariable, triggerDependencyUpdate]);

  // 注册变量到管理器
  // 这里只登记执行器，依赖分析与执行调度由下方的 reconcile 统一负责：
  // 子组件的 effect 先于 Provider 的 effect 执行，只有 reconcile 才能看到完整的变量集合
  const registerVariable = useCallback((meta: Omit<VariableExecutionMeta, 'dependencies'> & { variable: Variable }) => {
    const { name } = meta;

    // 如果已经注册过，先清理旧的订阅
    registeredVariables.current.get(name)?.cleanup?.();

    registeredVariables.current.set(name, {
      ...meta,
      dependencies: dependenciesByName.current[name] ?? [],
    });
  }, []);

  // 变量配置的签名列表，排除 label、value、options、hide 这些不影响执行逻辑的字段
  // 使用 useMemo 缓存以避免不必要的重新计算
  const variableSignatures = React.useMemo(() => variables.map((v) => [v.name, getVariableSignature(v)] as const), [variables]);
  const variablesKey = React.useMemo(() => variableSignatures.map(([name, signature]) => `${name}\u0000${signature}`).join(','), [variableSignatures]);

  // 变量列表或配置变化后的 reconcile
  // 该 effect 在所有变量组件完成注册之后运行，是唯一能同时看到完整变量集与完整注册表的时机
  useEffect(() => {
    // 当变量列表发生变化时，同步更新 ref
    variablesRef.current = variables;

    const signatures = new Map(variableSignatures);
    const previous = previousSignatures.current;

    // 移除已被删除的变量
    registeredVariables.current.forEach((meta, name) => {
      if (!signatures.has(name)) {
        meta.cleanup?.();
        registeredVariables.current.delete(name);
      }
    });

    // 依赖图只与变量配置有关，这里整体重建，避免部分变量未重新注册导致依赖边丢失
    const { graph, dependenciesByName: nextDependencies } = buildDependencyGraph(variables);
    dependencyGraph.current = graph;
    dependenciesByName.current = nextDependencies;
    applyDependencies();

    // 还有变量组件未完成注册时先不推进签名，等就绪后仍能识别出本次变化
    const allRegistered = variables.length > 0 && variables.every((v) => registeredVariables.current.has(v.name));
    if (!allRegistered) {
      return;
    }
    previousSignatures.current = signatures;

    let targets: string[];
    if (!initialized.current) {
      initialized.current = true;
      targets = variables.map((v) => v.name);
      // 首轮执行本就使用当前时间范围，标记为已处理，避免下方的 effect 再重复刷新一轮
      previousRangeSignature.current = rangeSignature;
    } else {
      // 新增的变量在 previous 中没有签名，同样会被识别为变化
      const changed = variables.filter((v) => previous?.get(v.name) !== signatures.get(v.name)).map((v) => v.name);
      targets = collectWithDownstream(changed, graph);
    }

    const token = ++reconcileToken.current;
    const isStale = () => token !== reconcileToken.current;

    void executeVariables(targets, isStale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variablesKey]);

  useEffect(() => {
    if (previousRangeSignature.current === rangeSignature) {
      return;
    }

    // 变量尚未完成首轮执行，交给 reconcile 处理即可，它会使用最新的时间范围
    if (!initialized.current) {
      return;
    }

    previousRangeSignature.current = rangeSignature;

    void (async () => {
      try {
        await refreshQueryVariablesForRangeChange();
      } catch (error) {
        console.error('[VariableManager] range refresh failed:', error);
      }
    })();
  }, [rangeSignature, refreshQueryVariablesForRangeChange]);

  return (
    <VariableManagerContext.Provider
      value={{
        getVariables,
        updateVariable,
        registerVariable,
        subscribeToVariable,
        registeredVariables,
      }}
    >
      {children}
    </VariableManagerContext.Provider>
  );
};
