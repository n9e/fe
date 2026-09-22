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
});
