import type { IDashboardConfig } from '../../types';
import type { IVariable } from '../../Variables/types';
import { prepareVariableRename } from './variableRename';

describe('prepareVariableRename', () => {
  it('updates persisted config and returns the same rewritten panels for immediate rendering', () => {
    const config = {
      version: '4.1.0',
      var: [{ name: 'old', type: 'custom', definition: 'one,two' }],
      panels: [
        {
          id: 'panel-1',
          name: 'Panel for $old',
          description: '',
          type: 'timeseries',
          targets: [{ refId: 'A', expr: 'metric{host="${old}"}' }],
          options: {},
          custom: {},
          overrides: [],
          layout: { i: 'panel-1', x: 0, y: 0, w: 12, h: 4 },
        },
      ],
    } as IDashboardConfig;
    const variables = [
      {
        name: 'renamed',
        type: 'custom',
        definition: 'one,two',
        value: 'one',
        options: [{ label: 'one', value: 'one' }],
        datasource: { cate: 'prometheus' },
      },
    ] as IVariable[];

    const result = prepareVariableRename(config, 'old', 'renamed', variables);

    expect(result.changes).toHaveLength(2);
    expect(result.configs.var).toEqual([{ name: 'renamed', type: 'custom', definition: 'one,two', datasource: { cate: 'prometheus' } }]);
    expect(result.configs.panels?.[0].name).toBe('Panel for $renamed');
    expect(result.configs.panels?.[0].targets?.[0].expr).toBe('metric{host="${renamed}"}');
    expect(result.panels?.[0].name).toBe('Panel for $renamed');
    expect(result.panels?.[0].targets?.[0].expr).toBe('metric{host="${renamed}"}');
    expect(config.panels?.[0].name).toBe('Panel for $old');
    expect(config.panels?.[0].targets?.[0].expr).toBe('metric{host="${old}"}');
  });

  it('returns no runtime panel state when the config has no panels', () => {
    const result = prepareVariableRename({ version: '4.1.0', var: [] } as IDashboardConfig, 'old', 'renamed', []);

    expect(result.panels).toBeUndefined();
  });

  it('rebuilds repeated panel instances using the renamed variable', () => {
    const config = {
      version: '4.1.0',
      var: [{ name: 'old', type: 'custom', definition: 'one,two' }],
      panels: [
        {
          id: 'row-1',
          name: 'Row',
          type: 'row',
          repeat: 'old',
          layout: { i: 'row-1', x: 0, y: 0, w: 24, h: 1 },
        },
        {
          id: 'panel-1',
          name: 'Panel',
          description: '',
          type: 'timeseries',
          targets: [{ refId: 'A', expr: 'metric{host="$old"}' }],
          options: {},
          custom: {},
          overrides: [],
          layout: { i: 'panel-1', x: 0, y: 1, w: 12, h: 4 },
        },
      ],
    } as IDashboardConfig;
    const variables = [
      {
        name: 'renamed',
        type: 'custom',
        definition: 'one,two',
        value: ['one', 'two'],
        datasource: { cate: 'prometheus' },
      },
    ] as IVariable[];

    const result = prepareVariableRename(config, 'old', 'renamed', variables);

    expect(result.panels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'panel-1__row_repeat_1',
          targets: [expect.objectContaining({ expr: 'metric{host="$renamed"}' })],
          scopedVars: expect.objectContaining({ renamed: { value: 'two' } }),
        }),
      ]),
    );
  });
});
