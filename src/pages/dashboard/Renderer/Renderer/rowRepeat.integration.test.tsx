/** @jest-environment jsdom */

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import moment from 'moment';

import { processRepeats } from '../../Panels/utils';
import { createDashboardRuntimeStore, DashboardRuntimeProvider } from '../../globalState';
import type { IPanel } from '../../types';
import type { IVariable } from '../../Variables/types';
import { resolveSharedPanelDatasource } from '../../Detail/utils/resolveSharedPanelDatasource';
import { buildDashboardQueryRequest } from '../datasource/contract';
import { fetchDashboardQuery } from '../datasource/service';
import Renderer from './index';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ datasourceList: [] }) }));
jest.mock('@/utils/constant', () => ({ N9E_PATHNAME: 'n9e', DatasourceCateEnum: { prometheus: 'prometheus', mysql: 'mysql' } }));
jest.mock('@/components/TimeRangePicker', () => ({ __esModule: true, default: () => null, parseRange: (range: unknown) => range }));
jest.mock('@/components/TimeRangePicker/utils', () => ({ parseRange: (range: unknown) => range }));
jest.mock('@/pages/dashboard/utils', () => ({ getDefaultStepByTime: () => 30 }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('ahooks', () => ({ ...jest.requireActual('ahooks'), useInViewport: () => [true] }));
jest.mock('../datasource/service', () => ({ fetchDashboardQuery: jest.fn() }));
jest.mock('../datasource/queryStep', () => ({ getDashboardQueryStep: () => 30 }));
jest.mock('../../Components/Markdown', () => ({ __esModule: true, default: ({ content }) => <div>{content}</div> }));
jest.mock('./Main', () => ({
  __esModule: true,
  default: ({ values }) => {
    const replace = require('../../Variables/utils/replaceTemplateVariables').useReplaceTemplateVariables();
    const Text = require('./Text').default;
    const Iframe = require('./Iframe').default;
    return (
      <section data-testid={values.id}>
        <h2>{replace(values.name)}</h2>
        <a href={replace('/detail?region=$region&field=${__field.name}', { scopedVars: { '__field.name': { value: 'cpu' } } })}>detail</a>
        {values.type === 'text' && <Text values={values} series={[]} />}
        {values.type === 'iframe' && <Iframe values={values} series={[]} />}
      </section>
    );
  },
}));

const time = { start: moment('2026-10-15T00:00:00Z'), end: moment('2026-10-15T01:00:00Z') };
const fetchDashboardQueryMock = fetchDashboardQuery as jest.MockedFunction<typeof fetchDashboardQuery>;

function panel(id: string, x: number, y: number, overrides: Partial<IPanel> = {}): IPanel {
  return {
    id,
    name: `${id}-$region`,
    description: '',
    type: 'timeseries',
    targets: [],
    options: {},
    custom: {},
    overrides: [],
    layout: { i: id, x, y, w: 8, h: 4 },
    ...overrides,
  } satisfies IPanel;
}
const region: IVariable = {
  name: 'region',
  type: 'custom',
  definition: '',
  datasource: { cate: 'prometheus' },
  multi: true,
  value: ['east', 'west'],
  options: [
    { label: 'East', value: 'east' },
    { label: 'West', value: 'west' },
  ],
};

beforeEach(() => jest.clearAllMocks());

test.each([false, true])('panel queries, text, iframe and links inherit the assigned row value (all=%s)', async (all) => {
  jest.useFakeTimers();
  try {
    fetchDashboardQueryMock.mockResolvedValue({ results: [] });
    const variables: IVariable[] = [
      { ...region, value: all ? ['all'] : region.value },
      { ...region, name: 'host', value: ['api', 'web'], options: [] },
    ];
    const targets: IPanel['targets'] = [
      { refId: 'A', datasource: { cate: 'prometheus', id: 1 }, expr: 'up{region="$region",host=~"$host"}', query: { nested: { region: '$region' } } },
    ];
    const panels = processRepeats(
      [
        panel('row', 0, 0, { type: 'row', repeat: 'region', layout: { i: 'row', x: 0, y: 0, w: 24, h: 1 } }),
        panel('query', 0, 1, { targets }),
        panel('text', 8, 1, { type: 'text', custom: { content: 'content-$region' } }),
        panel('iframe', 16, 1, { type: 'iframe', custom: { src: '/embed?region=$region' } }),
        panel('next', 0, 5, { type: 'row', layout: { i: 'next', x: 0, y: 5, w: 24, h: 1 } }),
        panel('outside', 0, 6, { targets }),
      ],
      variables,
    ).filter((item) => item.type !== 'row');
    const store = createDashboardRuntimeStore();
    store.setGlobalState('range', time);
    store.setGlobalState('variablesWithOptions', variables);
    render(
      <DashboardRuntimeProvider store={store}>
        {panels.map((item) => (
          <Renderer key={item.id} id={item.id} isPreview time={time} panelWidth={800} values={item} annotations={[]} />
        ))}
      </DashboardRuntimeProvider>,
    );
    ['east', 'west'].forEach((value, index) => {
      const suffix = index === 0 ? '' : '__row_repeat_1';
      expect(screen.getByTestId(`query${suffix}`)).toHaveTextContent(`query-${value}`);
      expect(screen.getByTestId(`text${suffix}`)).toHaveTextContent(`content-${value}`);
      expect(screen.getByTestId(`iframe${suffix}`).querySelector('iframe')).toHaveAttribute('src', `/embed?region=${value}`);
      expect(screen.getByTestId(`query${suffix}`).querySelector('a')).toHaveAttribute('href', `/detail?region=${value}&field=cpu`);
    });
    expect(screen.getByTestId('outside')).toHaveTextContent('outside-(east|west)');
    await act(async () => {
      jest.advanceTimersByTime(600);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(fetchDashboardQueryMock).toHaveBeenCalledTimes(3);
    const queries = fetchDashboardQueryMock.mock.calls.flatMap(([request]) => request.queries);
    expect(queries).toEqual(
      expect.arrayContaining(
        ['east', 'west', '(east|west)'].map((value) =>
          expect.objectContaining({
            kind: 'query',
            query: expect.objectContaining({ expr: `up{region="${value}",host=~"(api|web)"}`, nested: { region: value } }),
          }),
        ),
      ),
    );
    expect(store.getGlobalState('variablesWithOptions')).toEqual(variables);
  } finally {
    jest.useRealTimers();
  }
});

test('row-assigned datasource values are used by queries and shared panels', () => {
  const variable: IVariable = { ...region, name: 'source', type: 'datasource', value: ['1', '2'] };
  const datasourceList = [
    { id: 1, name: 'Main', plugin_type: 'prometheus', is_default: true },
    { id: 2, name: 'Backup', plugin_type: 'prometheus', is_default: false },
  ];
  const targets: IPanel['targets'] = [{ refId: 'A', datasource: { cate: 'prometheus', id: '$source' }, expr: 'up' }];
  const panels = processRepeats(
    [
      panel('row', 0, 0, { type: 'row', repeat: 'source', layout: { i: 'row', x: 0, y: 0, w: 24, h: 1 } }),
      panel('query', 0, 1, { targets, datasourceCate: 'prometheus', datasourceValue: '$source' }),
    ],
    [variable],
  ).filter((item) => item.type !== 'row');
  panels.forEach((item, index) => {
    const request = buildDashboardQueryRequest({ time, targets, variables: [variable], scopedVars: item.scopedVars, datasourceList });
    expect(request.queries[0]).toMatchObject({ datasource: { id: index + 1 } });
    expect(resolveSharedPanelDatasource(item, targets, datasourceList, [variable])).toMatchObject({ datasourceValue: index + 1, datasourceName: datasourceList[index].name });
  });
});
