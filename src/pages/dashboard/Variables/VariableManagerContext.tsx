import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import _ from 'lodash';

import { IVariable as Variable, VariableExecutionMeta, DependencyGraph } from './types';

function extractDependencies(str: string): string[] {
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
      dependencies.add(varName);
    }
  }

  return Array.from(dependencies);
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

  const getVariables = useCallback(() => {
    // 在依赖链执行期间，返回 ref 中的最新值
    return isExecutingChain.current ? variablesRef.current : variables;
  }, [variables]);

  // 更新变量值并通知订阅者
  const updateVariable = useCallback((name: string, partial: Partial<Variable>) => {
    console.log(`[updateVariable] 更新变量 ${name}`, partial);

    // 同步更新 ref 中的值，确保依赖链中立即可用
    variablesRef.current = _.map(variablesRef.current, (item) => {
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
          console.log(`[updateVariable] ${name} 的订阅者数量:`, variableSubscribers?.size || 0);
          if (variableSubscribers) {
            variableSubscribers.forEach((callback) => {
              console.log(`[updateVariable] 触发 ${name} 的订阅回调`);
              callback();
            });
          }
        } else {
          console.log(`[updateVariable] ${name} 在依赖链执行中，暂不触发订阅回调`);
        }
      },
      { name, ...partial },
    );
  }, []);

  // 订阅变量变化
  const subscribeToVariable = useCallback((variableName: string, callback: () => void) => {
    if (!subscribers.current.has(variableName)) {
      subscribers.current.set(variableName, new Set());
    }
    subscribers.current.get(variableName)!.add(callback);

    console.log(`[subscribeToVariable] 订阅 ${variableName}, 当前订阅者数量:`, subscribers.current.get(variableName)!.size);

    // 返回取消订阅的函数
    return () => {
      subscribers.current.get(variableName)?.delete(callback);
      console.log(`[subscribeToVariable] 取消订阅 ${variableName}, 剩余订阅者数量:`, subscribers.current.get(variableName)?.size || 0);
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
        console.log(`[triggerDependencyUpdate] ${dependencyName} 正在执行中，跳过重复触发`);
        return;
      }

      const dependentVariables = dependencyGraph.current[dependencyName] || [];
      console.log(`[triggerDependencyUpdate] ${dependencyName} 的依赖变量:`, dependentVariables);

      if (dependentVariables.length === 0) return;

      // 标记为正在执行
      executingDependencies.current.add(dependencyName);
      const isRootExecution = !isExecutingChain.current;
      if (isRootExecution) {
        isExecutingChain.current = true;
        console.log(`[triggerDependencyUpdate] ${dependencyName} 开始执行根依赖链`);
      }

      try {
        // 对依赖变量进行拓扑排序，确保执行顺序正确
        const executionOrder = topologicalSort(dependentVariables, dependencyGraph.current);
        console.log(`[triggerDependencyUpdate] 执行顺序:`, executionOrder);

        // 执行所有依赖变量
        for (const variableName of executionOrder) {
          const meta = registeredVariables.current.get(variableName);
          console.log(`[triggerDependencyUpdate] 准备执行 ${variableName}, meta 存在:`, !!meta);
          if (meta) {
            console.log(`[triggerDependencyUpdate] 开始执行 ${variableName}`);
            await meta.executor();
            console.log(`[triggerDependencyUpdate] 完成执行 ${variableName}`);
          }
        }
      } finally {
        // 执行完成后移除标记
        executingDependencies.current.delete(dependencyName);
        if (isRootExecution) {
          isExecutingChain.current = false;
          console.log(`[triggerDependencyUpdate] ${dependencyName} 完成根依赖链执行`);
        }
      }
    },
    [topologicalSort],
  );

  // 检查并执行初始化
  const checkAndExecuteInitialization = useCallback(() => {
    const registeredNames = new Set(registeredVariables.current.keys());
    const allRegistered = variables.length > 0 && variables.every((v) => registeredNames.has(v.name));

    console.log(
      `[checkAndExecuteInitialization] 已注册: ${registeredNames.size}/${variables.length}, allRegistered: ${allRegistered}, initialized: ${initialized.current}, pending: ${pendingInitialExecution.current.size}`,
    );

    if (allRegistered && !initialized.current && pendingInitialExecution.current.size > 0) {
      console.log('[VariableManager] 所有变量已注册，开始初始化执行');
      console.log('[VariableManager] 待执行的无依赖变量:', Array.from(pendingInitialExecution.current));

      initialized.current = true;

      // 执行所有无依赖的变量
      const executeInitialVariables = async () => {
        // 保存待执行的变量名，用于后续触发依赖链
        const initialVarNames = Array.from(pendingInitialExecution.current);

        // 设置执行锁，防止初始化期间触发依赖链
        isExecutingChain.current = true;
        console.log('[VariableManager] 设置初始化执行锁');

        try {
          for (const name of initialVarNames) {
            const meta = registeredVariables.current.get(name);
            if (meta) {
              console.log(`[VariableManager] 初始执行: ${name}`);
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
          console.log('[VariableManager] 释放初始化执行锁');

          // 初始化完成后，手动触发所有无依赖变量的依赖链
          console.log('[VariableManager] 触发初始化后的依赖链');
          for (const name of initialVarNames) {
            const dependentVariables = dependencyGraph.current[name] || [];
            if (dependentVariables.length > 0) {
              console.log(`[VariableManager] 触发 ${name} 的依赖链`);
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
      if (oldMeta?.cleanup) {
        console.log(`[registerVariable] 清理旧的 ${name} 注册`);
        oldMeta.cleanup();
      }

      // 自动分析依赖关系
      let dependencies: string[] = [];
      const dependencySet = new Set<string>();

      if (variable.type === 'query') {
        // 分析 definition 中的依赖
        if (variable.definition) {
          extractDependencies(variable.definition).forEach((dep) => dependencySet.add(dep));
        } else if (variable.query?.query) {
          extractDependencies(variable.query.query).forEach((dep) => dependencySet.add(dep));
        }

        // 分析 datasource.value 中的依赖
        if (variable.datasource?.value && typeof variable.datasource.value === 'string') {
          extractDependencies(variable.datasource.value).forEach((dep) => dependencySet.add(dep));
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

      console.log(`[registerVariable] 注册变量 ${name}, 依赖:`, dependencies);
      console.log(`[registerVariable] 依赖关系图:`, { ...dependencyGraph.current });

      // 如果是无依赖变量，加入待执行队列
      if (dependencies.length === 0) {
        pendingInitialExecution.current.add(name);
        console.log(`[registerVariable] ${name} 无依赖，加入待执行队列`);
      }

      // 订阅所有依赖变量的变化
      const unsubscribers = dependencies.map((dep) => {
        console.log(`[registerVariable] ${name} 订阅 ${dep} 的变化`);
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
    },
    [subscribeToVariable, triggerDependencyUpdate, checkAndExecuteInitialization],
  );

  // 清理依赖关系图（当变量列表变化时）
  const variableNamesKey = variables
    .map((v) => v.name)
    .sort()
    .join(',');
  const previousVariableNamesKey = useRef<string>('');

  useEffect(() => {
    // 当变量列表发生变化时，同步更新 ref
    variablesRef.current = variables;

    // 清理不存在的变量的依赖关系
    if (previousVariableNamesKey.current !== variableNamesKey) {
      const currentVariableNames = new Set(variables.map((v) => v.name));

      // 重置初始化状态
      initialized.current = false;
      pendingInitialExecution.current.clear();

      // 清理已删除变量的依赖关系
      Array.from(registeredVariables.current.keys()).forEach((name) => {
        if (!currentVariableNames.has(name)) {
          const meta = registeredVariables.current.get(name);
          if (meta?.cleanup) {
            meta.cleanup();
          }
          registeredVariables.current.delete(name);
          console.log(`[VariableManager] 清理已删除的变量: ${name}`);
        }
      });

      // 清理依赖关系图中已删除变量的引用
      Object.keys(dependencyGraph.current).forEach((dep) => {
        dependencyGraph.current[dep] = dependencyGraph.current[dep].filter((name) => currentVariableNames.has(name));
        if (dependencyGraph.current[dep].length === 0) {
          delete dependencyGraph.current[dep];
        }
      });

      previousVariableNamesKey.current = variableNamesKey;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variableNamesKey]);

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
