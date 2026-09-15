/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';
import moment from 'moment';

import Main from './Main';
import type { DashboardQueryState } from '../datasource/types';
import type { IPanel } from '../../types';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (value: string) => value }) }));
jest.mock('@/components/TimeRangePicker', () => ({ describeTimeRange: () => '' }));
jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({ __esModule: true, default: (value: string) => value }));
jest.mock('../../Editor/Components/Markdown', () => ({ __esModule: true, default: ({ content }: { content: string }) => <div>{content}</div> }));
jest.mock('../Inspect', () => () => null);
jest.mock('../components/CloneIcon', () => () => null);
jest.mock('../components/PanelEmpty', () => () => <div>empty</div>);
jest.mock('./TimeSeriesNG', () => () => null);
jest.mock('./Stat', () => () => null);
jest.mock('./Table', () => () => null);
jest.mock('./TableNG', () => () => null);
jest.mock('./Pie', () => () => null);
jest.mock('./Hexbin', () => () => null);
jest.mock('./BarGauge', () => () => null);
jest.mock('./Gauge', () => () => null);
jest.mock('./Iframe', () => () => <div data-testid='iframe-body' />);
jest.mock('./Heatmap', () => () => null);
jest.mock('./BarChart', () => () => null);

const time = {
  start: moment('2026-09-08T00:00:00.000Z'),
  end: moment('2026-09-08T01:00:00.000Z'),
};

const queryResult: DashboardQueryState = {
  query: [],
  series: [],
  errorsByRef: {},
  error: '',
  loading: false,
  loaded: false,
  range: time,
  revision: 0,
};

test('text panel renders its body before the query state is loaded', () => {
  render(
    <Main
      id='text-panel'
      panelWidth={400}
      values={
        {
          id: 'text-panel',
          type: 'text',
          name: 'Panel Title',
          description: '',
          layout: { h: 4, w: 12, x: 0, y: 0, i: 'text-panel' },
          targets: [{ refId: 'A' }],
          custom: { content: '$project' },
          options: {},
          overrides: [],
        } satisfies IPanel
      }
      annotations={[]}
      controllersVisible={false}
      queryResult={queryResult}
      containerEleRef={{ current: null }}
      time={time}
      inspect={false}
      setInspect={jest.fn()}
      setViewModalVisible={jest.fn()}
    />,
  );

  expect(screen.getByText('$project')).toBeInTheDocument();
  expect(document.querySelector('.renderer-body')).toBeInTheDocument();
});
