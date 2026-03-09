import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import _ from 'lodash';

import { IVariable as Variable, VariableExecutionMeta, DependencyGraph } from './types';

function extractDependencies(str: string, validVars?: Set<string>): string[] {
  // 正则表达式匹配$变量名格式
  // 匹配规则：
  // - 支持 $var 格式：$ 符号后跟一个或多个字母、数字、下划线
  // - 支持 ${var} 格式：$ 符号后跟大括号，内部为一个或多个字母、数字、下划线
  const regex = /\$\{([a-zA-Z0-9_]+)\}|\$([a-zA-Z0-9_]+)/g;
  let match;
  const dependencies = new Set<string>();

  while ((match = regex.exec(str)) !== null) {
    // 第一个捕获组是 ${var} 的情况，第二个是 $var 的情况
    const varName = match[1] || match[2];
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
function stringifyStable(obj: any): string {
  if (obj === null || obj === undefined) return String(obj);
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(stringifyStable).join(',') + ']';
  }
  // 对对象的键进行排序，确保一致的输出
  const keys = Object.keys(obj).sort();
  return '{' + keys.map((k) => `"${k}":${stringifyStable(obj[k])}`).join(',') + '}';
}

interface VariableManagerContextType {
  getVariables: () => Variable[];
  updateVariable: (name: string, partial: Partial<Variable>) => void;
  registerVariable: (meta: Omit<VariableExecutionMeta, 'dependencies'> & { variable: Variable }) => void;
  subscribeToVariable: (variableName: string, callback: () => void) => () => void;
  registeredVariables: React.MutableRefObject<Map<string, VariableExecutionMeta>>;
}

const VariableManagerContext = createContext<VariableManagerContextType | undefined>(undefined);

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
  // 变量值的同步副本，用于在依赖链执行中获取最新值
  const variablesRef = useRef<Variable[]>(variables);
  // Ensure ref is synced with props during render to be available for children's effects
  if (variables !== variablesRef.current) {
    variablesRef.current = variables;
  }
  // 依赖关系图
  const dependencyGraph = useRef<DependencyGraph>({});
  // 订阅者映射：key为变量名，value为订阅该变量变化的回调函数列表
  const subscribers = useRef<Map<string, Set<() => void>>>(new Map());
  // 执行锁：防止递归触发依赖更新
  const executingDependencies = useRef<Set<string>>(new Set());
  // 全局执行锁：标记是否正在执行依赖链
  const isExecutingChain = useRef(false);
  // 初始化状态：标记是否已完成初始执行
  const initialized = useRef(false);
  // 等待初始化的变量队列
  const pendingInitialExecution = useRef<Set<string>>(new Set());
  // 追踪正在重新执行的变量，防止并发竞争
  const reExecutingVariables = useRef<Set<string>>(new Set());

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
    const inDegree: Record<string, number> = {};
    const queue: string[] = [];
    const result: string[] = [];

    // 计算每个节点的入度
    nodes.forEach((node) => {
      inDegree[node] = registeredVariables.current.get(node)?.dependencies.filter((dep) => nodes.includes(dep)).length || 0;
    });

    // 将入度为 0 的节点加入初始队列
    nodes.forEach((node) => {
      if (inDegree[node] === 0) {
        queue.push(node);
      }
    });

    // 执行拓扑排序
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      // 处理所有依赖当前变量的下游变量
      (graph[current] || []).forEach((dep) => {
        if (nodes.includes(dep)) {
          inDegree[dep]--;
          if (inDegree[dep] === 0) queue.push(dep);
        }
      });
    }

    // 检查是否有循环依赖
    if (result.length !== nodes.length) {
      const cycleNodes = nodes.filter((node) => !result.includes(node));
      console.error('检测到循环依赖:', cycleNodes);
      throw new Error(`循环依赖检测: ${cycleNodes.join(', ')}`);
    }

    return result;
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
      const isRootExecution = !isExecutingChain.current;
      if (isRootExecution) {
        isExecutingChain.current = true;
      }

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
        if (isRootExecution) {
          isExecutingChain.current = false;
        }
      }
    },
    [topologicalSort],
  );

  // 检查并执行初始化
  const checkAndExecuteInitialization = useCallback(() => {
    const registeredNames = new Set(registeredVariables.current.keys());
    const allRegistered = variables.length > 0 && variables.every((v) => registeredNames.has(v.name));

    if (allRegistered && !initialized.current && pendingInitialExecution.current.size > 0) {
      initialized.current = true;

      // 执行所有无依赖的变量
      const executeInitialVariables = async () => {
        // 保存待执行的变量名，用于后续触发依赖链
        const initialVarNames = Array.from(pendingInitialExecution.current);

        // 设置执行锁，防止初始化期间触发依赖链
        isExecutingChain.current = true;

        try {
          for (const name of initialVarNames) {
            const meta = registeredVariables.current.get(name);
            if (meta) {
              try {
                await meta.executor();
              } catch (error) {
                console.error(`[VariableManager] 执行 ${name} 失败:`, error);
              }
            }
          }
          pendingInitialExecution.current.clear();
        } finally {
          // 释放执行锁
          isExecutingChain.current = false;

          // 初始化完成后，手动触发所有无依赖变量的依赖链
          for (const name of initialVarNames) {
            const dependentVariables = dependencyGraph.current[name] || [];
            if (dependentVariables.length > 0) {
              await triggerDependencyUpdate(name);
            }
          }
        }
      };

      executeInitialVariables();
    }
  }, [variables, triggerDependencyUpdate]);

  // 注册变量到管理器（自动分析依赖）
  const registerVariable = useCallback(
    async (meta: Omit<VariableExecutionMeta, 'dependencies'> & { variable: Variable }) => {
      const { name, variable } = meta;

      // 如果已经注册过，先清理旧的订阅
      const oldMeta = registeredVariables.current.get(name);
      const wasRegistered = !!oldMeta;
      if (oldMeta?.cleanup) {
        oldMeta.cleanup();
      }

      // 自动分析依赖关系
      let dependencies: string[] = [];
      const dependencySet = new Set<string>();
      const validVarNames = new Set(variablesRef.current.map((v) => v.name));

      if (variable.type === 'query') {
        // 分析 definition 中的依赖
        if (variable.definition) {
          extractDependencies(variable.definition, validVarNames).forEach((dep) => dependencySet.add(dep));
        } else if (variable.query?.query) {
          extractDependencies(variable.query.query, validVarNames).forEach((dep) => dependencySet.add(dep));
        }

        // 分析 datasource.value 中的依赖
        if (variable.datasource?.value && typeof variable.datasource.value === 'string') {
          extractDependencies(variable.datasource.value, validVarNames).forEach((dep) => dependencySet.add(dep));
        }
      }

      dependencies = Array.from(dependencySet);

      // 更新依赖关系图
      dependencies.forEach((dep) => {
        if (!dependencyGraph.current[dep]) dependencyGraph.current[dep] = [];
        if (!dependencyGraph.current[dep].includes(name)) {
          dependencyGraph.current[dep].push(name);
        }
      });

      // 创建完整的执行元数据
      const fullMeta: VariableExecutionMeta = {
        ...meta,
        dependencies,
      };

      registeredVariables.current.set(name, fullMeta);

      // 如果是无依赖变量，加入待执行队列
      if (dependencies.length === 0) {
        pendingInitialExecution.current.add(name);
      }

      // 订阅所有依赖变量的变化
      const unsubscribers = dependencies.map((dep) => {
        return subscribeToVariable(dep, () => {
          triggerDependencyUpdate(dep);
        });
      });

      // 添加清理函数
      if (fullMeta.cleanup) {
        const originalCleanup = fullMeta.cleanup;
        fullMeta.cleanup = () => {
          originalCleanup();
          unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
      } else {
        fullMeta.cleanup = () => {
          unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
      }

      // 检查是否所有变量都已注册，如果是则触发初始化
      checkAndExecuteInitialization();

      // 变量配置变更后需要立即重新执行并触发依赖链（防止并发竞争）
      if (wasRegistered && initialized.current) {
        // 如果已经在重新执行，则跳过（防止同一变量的多个重新执行竞争）
        if (reExecutingVariables.current.has(name)) {
          return;
        }

        const reExecute = async () => {
          reExecutingVariables.current.add(name);
          try {
            await fullMeta.executor();
          } catch (error) {
            console.error(`[registerVariable] 重新执行 ${name} 失败:`, error);
          } finally {
            await triggerDependencyUpdate(name);
            reExecutingVariables.current.delete(name);
          }
        };
        reExecute();
      }
    },
    [subscribeToVariable, triggerDependencyUpdate, checkAndExecuteInitialization],
  );

  // 清理依赖关系图（当变量列表或配置变化时）
  // 生成包含关键配置的 key，排除 label、value、options、hide 这些不影响执行逻辑的字段
  // 使用 useMemo 缓存以避免不必要的重新计算
  const variablesKey = React.useMemo(() => {
    return variables
      .map((v) => {
        const { label, value, options, hide, ...rest } = v;
        return stringifyStable(rest);
      })
      .sort()
      .join(',');
  }, [variables]);

  const variableNamesKey = React.useMemo(() => {
    return variables
      .map((v) => v.name)
      .sort()
      .join(',');
  }, [variables]);
  const previousVariablesKey = useRef<string>('');
  const previousVariableNamesKey = useRef<string>('');

  useEffect(() => {
    // 当变量列表发生变化时，同步更新 ref
    variablesRef.current = variables;

    // 清理不存在的变量的依赖关系，或配置已变化的变量
    if (!previousVariablesKey.current) {
      previousVariablesKey.current = variablesKey;
      previousVariableNamesKey.current = variableNamesKey;
      return;
    }

    if (previousVariablesKey.current !== variablesKey) {
      const currentVariableNames = new Set(variables.map((v) => v.name));
      const namesChanged = previousVariableNamesKey.current !== variableNamesKey;

      // 仅在变量列表发生变化时重置初始化状态
      if (namesChanged) {
        initialized.current = false;
        pendingInitialExecution.current.clear();
      }

      // 清理所有已注册变量的注册信息（配置变化时需要重新注册）
      Array.from(registeredVariables.current.keys()).forEach((name) => {
        const meta = registeredVariables.current.get(name);
        if (meta?.cleanup) {
          meta.cleanup();
        }
        // 如果变量已被删除，则从注册表中移除；否则保留但会在重新注册时被覆盖
        if (!currentVariableNames.has(name)) {
          registeredVariables.current.delete(name);
        }
      });

      // 清理依赖关系图，准备重新构建
      dependencyGraph.current = {};

      previousVariablesKey.current = variablesKey;
      previousVariableNamesKey.current = variableNamesKey;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variablesKey]);

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
