/** @jest-environment jsdom */
import React from 'react';
import { render, renderHook } from '@testing-library/react';
import DorisSidebar from '@/plugins/doris/ExplorerNG/SideBarNav/FieldsSidebar';
import ClickHouseSidebar from '@/plugins/clickHouse/ExplorerNG/SideBarNav/FieldsSidebar';
import useFieldStatsCache from './useFieldStatsCache';

let mockProps: any;
const mockRequest = jest.fn();
const mockQuery = { database: 'logs', table: 'events', time_field: 'timestamp', query: 'service:api', range: {} };
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Form: { useFormInstance: () => ({}), useWatch: (key: string | string[]) => (key === 'query' ? mockQuery : key === 'refreshFlag' ? 'same-refresh' : 101) },
}));
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: () => ({ start: 100000, end: 200000 }) }));
jest.mock('./index', () => (props: any) => {
  mockProps = props;
  return null;
});
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { doris: 'doris', ck: 'ck' } }));
jest.mock('@/plugins/doris/constants', () => ({ NAME_SPACE: 'doris', TYPE_MAP: { string: 'string' } }));
jest.mock('@/plugins/clickHouse/constants', () => ({ NAME_SPACE: 'ck', getCKFieldIconType: () => 'string', isCKNumberType: () => false }));
jest.mock('@/plugins/doris/services', () => ({ getDorisLogsQuery: (...args: any[]) => mockRequest(...args) }));
jest.mock('@/plugins/clickHouse/services', () => ({ getCKLogsQuery: (...args: any[]) => mockRequest(...args) }));
jest.mock('@/pages/dashboard/Renderer/utils/byteConverter', () => ({ format: (value: number) => ({ text: String(value) }) }));

const field = { field: 'service', type: 'string', indexable: true };
const props = {
  data: [field],
  organizeFields: [],
  setOrganizeFields: jest.fn(),
  loading: false,
  onValueFilter: jest.fn(),
  executeQuery: jest.fn(),
  setStackByField: jest.fn(),
  setDefaultSearchField: jest.fn(),
};
const response = {
  list: [
    { ref: 'top5', service: 'api', ratio: 70, count: 7 },
    { ref: 'exist_ratio', exist_ratio: 70 },
  ],
};

describe.each([
  ['Doris', DorisSidebar],
  ['ClickHouse', ClickHouseSidebar],
] as const)('%s statistics provider', (_, Sidebar) => {
  beforeEach(() => mockRequest.mockReset());

  it('evicts a genuine failure and retries in exactly the same query scope', async () => {
    render(<Sidebar {...props} />);
    const { result } = renderHook(() => useFieldStatsCache(mockProps.statsCacheKey, mockProps.fetchStats, mockProps.fetchUniqueCount));
    mockRequest.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(response);
    await expect(result.current.fetchStats!(field)).rejects.toThrow('network');
    await expect(result.current.fetchStats!(field)).resolves.toMatchObject({ topN: [{ value: 'api', percent: 70, count: 7 }] });
    expect(mockRequest).toHaveBeenCalledTimes(2);
    expect(mockRequest.mock.calls[0][0]).toEqual(mockRequest.mock.calls[1][0]);
  });

  it.each([undefined, null, '1.2K'])('preserves Top-5/other metrics when cardinality is %s and uses count-only fallback', async (value) => {
    render(<Sidebar {...props} />);
    const { result } = renderHook(() => useFieldStatsCache(mockProps.statsCacheKey, mockProps.fetchStats, mockProps.fetchUniqueCount));
    mockRequest.mockResolvedValueOnce({ list: [...response.list, { ref: 'unique_count', unique_count: value }] });
    await expect(result.current.fetchStats!(field)).resolves.toMatchObject({ uniqueCount: undefined, topN: [{ value: 'api' }], stats: { exist_ratio: '70' } });
    mockRequest.mockResolvedValueOnce({ list: [{ ref: 'unique_count', unique_count: 3 }] });
    await expect(result.current.getUniqueCount!(field)).resolves.toBe(3);
    expect(mockRequest.mock.calls[1][0].query.map((item: any) => item.func)).toEqual(['unique_count']);
  });
});
