/// <reference types="jest" />

import { getQueryVariableExecutionOrderForRangeChange } from '../VariableManagerContext';
import { IVariable, VariableExecutionMeta, DependencyGraph } from '../types';

describe('getQueryVariableExecutionOrderForRangeChange', () => {
  test('should only execute registered query variables in dependency order', () => {
    const variables = [
      {
        name: 'region',
        type: 'query',
        definition: 'label_values(region)',
        datasource: { cate: 'prometheus' },
      },
      {
        name: 'instance',
        type: 'query',
        definition: 'label_values(up{region="$region"}, instance)',
        datasource: { cate: 'prometheus' },
      },
      {
        name: 'env',
        type: 'custom',
        definition: 'prod,dev',
        datasource: { cate: 'prometheus' },
      },
      {
        name: 'job',
        type: 'query',
        definition: 'label_values(up{instance="$instance"}, job)',
        datasource: { cate: 'prometheus' },
      },
      {
        name: 'orphan',
        type: 'query',
        definition: 'label_values(orphan)',
        datasource: { cate: 'prometheus' },
      },
    ] as IVariable[];

    const registeredVariables = new Map<string, Pick<VariableExecutionMeta, 'dependencies'>>([
      ['region', { dependencies: [] }],
      ['instance', { dependencies: ['region'] }],
      ['job', { dependencies: ['instance'] }],
    ]);

    const dependencyGraph: DependencyGraph = {
      region: ['instance'],
      instance: ['job'],
    };

    expect(getQueryVariableExecutionOrderForRangeChange(variables, registeredVariables, dependencyGraph)).toEqual(['region', 'instance', 'job']);
  });

  test('should return empty array when there are no registered query variables', () => {
    const variables = [
      {
        name: 'env',
        type: 'custom',
        definition: 'prod,dev',
        datasource: { cate: 'prometheus' },
      },
    ] as IVariable[];

    expect(getQueryVariableExecutionOrderForRangeChange(variables, new Map(), {})).toEqual([]);
  });

  test('should throw when query variable dependencies contain a cycle', () => {
    const variables = [
      {
        name: 'a',
        type: 'query',
        definition: 'label_values(metric{b="$b"}, a)',
        datasource: { cate: 'prometheus' },
      },
      {
        name: 'b',
        type: 'query',
        definition: 'label_values(metric{a="$a"}, b)',
        datasource: { cate: 'prometheus' },
      },
    ] as IVariable[];

    const registeredVariables = new Map<string, Pick<VariableExecutionMeta, 'dependencies'>>([
      ['a', { dependencies: ['b'] }],
      ['b', { dependencies: ['a'] }],
    ]);

    const dependencyGraph: DependencyGraph = {
      a: ['b'],
      b: ['a'],
    };

    expect(() => getQueryVariableExecutionOrderForRangeChange(variables, registeredVariables, dependencyGraph)).toThrow('循环依赖检测: a, b');
  });
});
