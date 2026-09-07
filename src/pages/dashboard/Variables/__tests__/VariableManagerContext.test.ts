/// <reference types="jest" />

import { buildDependencyGraph, collectVariableDependencies, extractDependencies, getQueryVariableExecutionOrderForRangeChange } from '../VariableManagerContext';
import { IVariable, VariableExecutionMeta, DependencyGraph } from '../types';

describe('extractDependencies', () => {
  test('should extract variables from ${var} format', () => {
    expect(extractDependencies('${region}')).toEqual(['region']);
  });

  test('should extract variables from $var format', () => {
    expect(extractDependencies('$region')).toEqual(['region']);
  });

  test('should extract multiple variables from mixed formats', () => {
    expect(extractDependencies('${region}/${namespace}/$metric')).toEqual(['region', 'namespace', 'metric']);
  });

  test('should not extract duplicates', () => {
    expect(extractDependencies('${region}_$region')).toEqual(['region']);
  });

  test('should filter out variables not in validVarNames', () => {
    const validVars = new Set(['region']);
    expect(extractDependencies('${region}/${namespace}', validVars)).toEqual(['region']);
  });

  test('should return empty array for string without variables', () => {
    expect(extractDependencies('plain string')).toEqual([]);
  });

  test('should return empty array for empty string', () => {
    expect(extractDependencies('')).toEqual([]);
  });

  test('should extract from CloudWatch-like query sub-field values', () => {
    // Simulates query sub-fields like query.region = '${region}',
    // query.namespace = '${namespace}' etc.
    expect(extractDependencies('${region}')).toEqual(['region']);
    expect(extractDependencies('${namespace}')).toEqual(['namespace']);
    expect(extractDependencies('${region}/${namespace}')).toEqual(['region', 'namespace']);
  });

  test('should extract dependencies with trailing text', () => {
    expect(extractDependencies('${region}-suffix')).toEqual(['region']);
  });
});

describe('collectVariableDependencies', () => {
  test('should ignore non-query variables even when they reference other variables', () => {
    const variable = {
      name: 'db',
      type: 'datasource',
      definition: 'gcm',
      regex: '/$env/',
      datasource: { cate: 'gcm' },
    } as IVariable;

    expect(collectVariableDependencies(variable, new Set(['db', 'env']))).toEqual([]);
  });

  test('should not treat a self reference as a dependency', () => {
    const variable = {
      name: 'a',
      type: 'query',
      definition: 'label_values(up{a="$a"}, a)',
      datasource: { cate: 'prometheus' },
    } as IVariable;

    expect(collectVariableDependencies(variable, new Set(['a']))).toEqual([]);
  });

  test('should collect from definition and datasource.value together', () => {
    const variable = {
      name: 'metric',
      type: 'query',
      definition: 'label_values(up{region="$region"}, metric)',
      datasource: { cate: 'prometheus', value: '${db}' },
    } as IVariable;

    expect(collectVariableDependencies(variable, new Set(['metric', 'region', 'db']))).toEqual(['region', 'db']);
  });

  test('should collect references from nested query filters and arrays', () => {
    const variable = {
      name: 'metric',
      type: 'query',
      definition: '',
      datasource: { cate: 'gcm' },
      query: {
        filters: [{ key: 'zone', value: '${zone}' }],
        group_bys: ['[[project]]', 'literal'],
      },
    } as IVariable;

    expect(collectVariableDependencies(variable, new Set(['metric', 'project', 'zone']))).toEqual(['zone', 'project']);
  });
});

describe('buildDependencyGraph', () => {
  test('should link a query variable to the datasource variable used by datasource.value', () => {
    const variables = [
      {
        name: 'db',
        type: 'datasource',
        definition: 'gcm',
        datasource: { cate: 'gcm' },
      },
      {
        name: 'project',
        type: 'query',
        definition: '',
        datasource: { cate: 'gcm', value: '${db}' },
      },
    ] as IVariable[];

    expect(buildDependencyGraph(variables)).toEqual({
      graph: { db: ['project'] },
      dependenciesByName: { db: [], project: ['db'] },
    });
  });

  test('should collect dependencies from query sub-fields', () => {
    const variables = [
      {
        name: 'region',
        type: 'query',
        definition: 'regions',
        datasource: { cate: 'cloudwatch' },
        query: { type: 'regions' },
      },
      {
        name: 'namespace',
        type: 'query',
        definition: 'namespaces',
        datasource: { cate: 'cloudwatch' },
      },
      {
        name: 'metric',
        type: 'query',
        definition: '',
        datasource: { cate: 'cloudwatch' },
        query: { region: '${region}', namespace: '[[namespace]]' },
      },
    ] as IVariable[];

    expect(buildDependencyGraph(variables)).toEqual({
      graph: { region: ['metric'], namespace: ['metric'] },
      dependenciesByName: { region: [], namespace: [], metric: ['region', 'namespace'] },
    });
  });

  test('should drop references to variables that do not exist', () => {
    const variables = [
      {
        name: 'instance',
        type: 'query',
        definition: 'label_values(up{region="$region"}, instance)',
        datasource: { cate: 'prometheus' },
      },
    ] as IVariable[];

    expect(buildDependencyGraph(variables)).toEqual({
      graph: {},
      dependenciesByName: { instance: [] },
    });
  });
});

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

  test('should handle CloudWatch-style variables with query sub-field dependencies', () => {
    const variables = [
      {
        name: 'region',
        type: 'query',
        definition: 'regions',
        datasource: { cate: 'cloudwatch' },
        query: { type: 'regions' },
      },
      {
        name: 'namespace',
        type: 'query',
        definition: 'namespaces',
        datasource: { cate: 'cloudwatch' },
        query: { type: 'namespaces', region: '${region}' },
      },
      {
        name: 'env',
        type: 'custom',
        definition: 'prod,dev',
        datasource: { cate: 'prometheus' },
      },
    ] as IVariable[];

    const registeredVariables = new Map<string, Pick<VariableExecutionMeta, 'dependencies'>>([
      ['region', { dependencies: [] }],
      ['namespace', { dependencies: ['region'] }],
    ]);

    const dependencyGraph: DependencyGraph = {
      region: ['namespace'],
    };

    // region should be executed before namespace (which depends on region)
    expect(getQueryVariableExecutionOrderForRangeChange(variables, registeredVariables, dependencyGraph)).toEqual(['region', 'namespace']);
  });

  test('should handle chain of CloudWatch-style variables', () => {
    const variables = [
      {
        name: 'region',
        type: 'query',
        definition: 'regions',
        datasource: { cate: 'cloudwatch' },
        query: { type: 'regions' },
      },
      {
        name: 'namespace',
        type: 'query',
        definition: 'namespaces',
        datasource: { cate: 'cloudwatch' },
        query: { type: 'namespaces', region: '${region}' },
      },
      {
        name: 'metric',
        type: 'query',
        definition: 'metrics',
        datasource: { cate: 'cloudwatch' },
        query: { type: 'metrics', region: '${region}', namespace: '${namespace}' },
      },
    ] as IVariable[];

    const registeredVariables = new Map<string, Pick<VariableExecutionMeta, 'dependencies'>>([
      ['region', { dependencies: [] }],
      ['namespace', { dependencies: ['region'] }],
      ['metric', { dependencies: ['region', 'namespace'] }],
    ]);

    const dependencyGraph: DependencyGraph = {
      region: ['namespace', 'metric'],
      namespace: ['metric'],
    };

    // region -> namespace -> metric
    expect(getQueryVariableExecutionOrderForRangeChange(variables, registeredVariables, dependencyGraph)).toEqual(['region', 'namespace', 'metric']);
  });
});
