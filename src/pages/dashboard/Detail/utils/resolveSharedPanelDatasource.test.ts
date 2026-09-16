jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({
  replaceDatasourceVariables: (value: number | string) => (value === '${datasource}' ? 849 : value),
}));

import type { DashboardDatasource, IPanel, ITarget } from '@/pages/dashboard/types';

import { resolveSharedPanelDatasource } from './resolveSharedPanelDatasource';

const datasourceList: DashboardDatasource[] = [
  { id: 849, name: 'prom-main', plugin_type: 'prometheus', is_default: true },
  { id: 850, name: 'gcm-main', plugin_type: 'gcm', is_default: false },
];

describe('resolveSharedPanelDatasource', () => {
  it('resolves a panel-level datasource variable when targets have no datasource', () => {
    const result = resolveSharedPanelDatasource(
      { datasourceCate: 'prometheus', datasourceValue: '${datasource}' } as Pick<IPanel, 'datasourceCate' | 'datasourceValue'>,
      [{ refId: 'A', expr: 'up' }] as ITarget[],
      datasourceList,
    );

    expect(result).toEqual({
      datasourceCate: 'prometheus',
      datasourceValue: 849,
      datasourceName: 'prom-main',
    });
  });

  it('uses target-level datasources to retain a genuine mixed-datasource panel', () => {
    const result = resolveSharedPanelDatasource(
      { datasourceCate: 'mixed', datasourceValue: 'mixed' } as Pick<IPanel, 'datasourceCate' | 'datasourceValue'>,
      [
        { refId: 'A', datasource: { cate: 'prometheus', id: 849 }, expr: 'up' },
        { refId: 'B', datasource: { cate: 'gcm', id: 850 }, expr: 'fetch' },
      ] as ITarget[],
      datasourceList,
    );

    expect(result).toEqual({
      datasourceCate: 'mixed',
      datasourceValue: 'mixed',
      datasourceName: 'prom-main, gcm-main',
    });
  });
});
