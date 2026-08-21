import moment from 'moment';

import { buildDashboardQueryRequest } from '@/pages/dashboard/Renderer/datasource/contract';
import { upgradeTableToNG } from '@/pages/dashboard/utils/upgradeTableToNG';

jest.mock('@/components/TimeRangePicker/utils', () => ({ parseRange: (range: unknown) => range }));
jest.mock('@/pages/dashboard/Renderer/datasource/queryStep', () => ({ getDashboardQueryStep: () => 30 }));
jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({ __esModule: true, default: (value: string) => value, replaceDatasourceVariables: (value: number | string) => value }));

describe('legacy table upgrade query integration', () => {
  it('converts the editor value to TableNG and preserves instant query and transformed columns', () => {
    const upgraded = upgradeTableToNG(
      {
        id: 'legacy-table', type: 'table',
        custom: { displayMode: 'seriesToRows' },
        targets: [{ refId: 'A', expr: 'up' }],
      },
      ['__name__', '__value_#A'],
    );
    const request = buildDashboardQueryRequest({
      time: { start: moment('2026-07-24T00:00:00.000Z'), end: moment('2026-07-24T01:00:00.000Z') },
      targets: upgraded.targets,
      datasourceList: [],
      legacyDatasource: { cate: 'prometheus', id: 1 },
    });

    expect(upgraded).toMatchObject({
      type: 'tableNG',
      transformationsNG: [{ id: 'organize', options: { renameByName: { __name__: 'name', '__value_#A': 'value' } } }],
    });
    expect(request.queries).toMatchObject([{ ref_id: 'A', datasource: { cate: 'prometheus', id: 1 }, query: { instant: true, expr: 'up' } }]);
  });
});
