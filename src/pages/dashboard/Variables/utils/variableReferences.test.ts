import type { IDashboardConfig } from '../../types';

import { countVariableReferences, renameVariableReferences } from './variableReferences';

describe('dashboard variable reference rewriting', () => {
  const configs = {
    version: '4.1.0',
    var: [{ name: 'project', type: 'textbox', definition: '$project' }],
    panels: [
      {
        id: 'panel-1',
        type: 'timeseries',
        name: '[[project]] overview',
        description: '${project}',
        links: [{ url: '/detail?project=$project' }],
        targets: [
          {
            expr: 'up{project="$project"}',
            expression: '$A + 1',
            datasource: { id: '${project}' },
          },
        ],
      },
    ],
  } as IDashboardConfig;

  it('updates supported variable syntaxes and keeps expression ref ids unchanged', () => {
    const result = renameVariableReferences(configs, 'project', 'environment');

    expect(result.changes).toHaveLength(6);
    expect(JSON.stringify(result.configs)).toContain('environment');
    expect((result.configs.panels[0].targets?.[0] as { expression: string }).expression).toBe('$A + 1');
    expect(JSON.stringify(configs)).toContain('project');
  });

  it('uses the same syntax-aware traversal when checking whether deletion is safe', () => {
    expect(countVariableReferences(configs, 'project')).toBe(6);
    expect(countVariableReferences(configs, 'missing')).toBe(0);
  });

  it('counts changed configuration fields rather than individual placeholders', () => {
    const repeatedReferences = {
      panels: [
        {
          targets: [
            {
              expr: 'rate(requests{project="$project"}[5m]) + ${project} + [[project]]',
              expression: '$A + 1',
            },
          ],
        },
      ],
    } as IDashboardConfig;

    const result = renameVariableReferences(repeatedReferences, 'project', 'environment');

    expect(result.changes).toHaveLength(1);
    expect(result.changes[0]).toMatchObject({
      path: 'panels[0].targets[0].expr',
      before: 'rate(requests{project="$project"}[5m]) + ${project} + [[project]]',
      after: 'rate(requests{project="$environment"}[5m]) + ${environment} + [[environment]]',
    });
    expect(result.configs.panels[0].targets?.[0]).toMatchObject({ expression: '$A + 1' });
    expect(countVariableReferences(repeatedReferences, 'project')).toBe(1);
    expect((repeatedReferences.panels[0].targets?.[0] as { expr: string }).expr).toContain('$project');
  });

  it('does not replace longer variable names that only share a prefix', () => {
    const configsWithPrefix = {
      panels: [{ targets: [{ expr: '$projectName + ${project_name} + [[project]]' }] }],
    } as IDashboardConfig;

    const result = renameVariableReferences(configsWithPrefix, 'project', 'environment');

    expect(result.changes).toHaveLength(1);
    expect((result.configs.panels[0].targets?.[0] as { expr: string }).expr).toBe('$projectName + ${project_name} + [[environment]]');
  });

  it('updates direct repeat-field references and counts them as configuration references', () => {
    const repeatedPanels = {
      panels: [
        { type: 'row', repeat: 'project' },
        { type: 'timeseries', repeat: 'projected' },
      ],
    } as IDashboardConfig;

    const result = renameVariableReferences(repeatedPanels, 'project', 'environment');

    expect(result.changes).toEqual([{ path: 'panels[0].repeat', before: 'project', after: 'environment' }]);
    expect(result.configs.panels[0].repeat).toBe('environment');
    expect(result.configs.panels[1].repeat).toBe('projected');
    expect(countVariableReferences(repeatedPanels, 'project')).toBe(1);
  });
});
