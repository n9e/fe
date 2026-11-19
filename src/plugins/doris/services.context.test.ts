import { RequestMethod } from '@/store/common';
import request from '@/utils/request';

import { getDorisContextLogs, getDorisLogsQuery } from './services';

jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn() }));

const mockedRequest = request as unknown as jest.Mock;

const page = {
  logs: [{ __index_number__: 0, message: 'current' }],
  back_cursor: { seq: '99', time: '2026-10-29 09:59:59.000', index: 0 },
  forward_cursor: { seq: '101', time: '2026-10-29 10:00:01.000', index: 0 },
  has_back: true,
  has_forward: true,
  back_scan_limited: false,
  forward_scan_limited: false,
};

describe('getDorisContextLogs', () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it('posts the context query to the plus endpoint and unwraps dat', async () => {
    mockedRequest.mockResolvedValue({ dat: page });
    const data = {
      cate: 'doris',
      datasource_id: 1,
      query: [
        {
          stream_id: 's1',
          seq: '100',
          time: '2026-10-29 10:00:00.000',
          cursor_index: 0,
          back_lines: 30,
          forward_lines: 0,
          database: 'db',
          table: 't',
          time_field: 'ts',
        },
      ],
    };

    await expect(getDorisContextLogs(data)).resolves.toEqual(page);
    expect(mockedRequest).toHaveBeenCalledWith('/api/n9e-plus/doris-context-logs-query', { method: RequestMethod.Post, data });
  });
});

describe('getDorisLogsQuery', () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it('forwards search_after and only enabled query builder filters', async () => {
    mockedRequest.mockResolvedValue({ dat: { list: [], total: 0 } });
    await getDorisLogsQuery({
      cate: 'doris',
      datasource_id: 1,
      query: [
        {
          database: 'db',
          table: 't',
          time_field: 'ts',
          query: 'error',
          from: 1,
          to: 2,
          lines: 100,
          offset: 100,
          reverse: false,
          search_after: { time: '2026-10-29 10:00:00.000', stream_id: 's1', seq: '100' },
          query_builder_filter: [
            { field: 'a', operator: 'AND', value: 1 },
            { field: 'b', operator: 'AND', value: 2, disabled: true },
          ],
        },
      ],
    });

    const payload = mockedRequest.mock.calls[0][1].data;
    expect(payload.query[0].search_after).toEqual({ time: '2026-10-29 10:00:00.000', stream_id: 's1', seq: '100' });
    expect(payload.query[0].query_builder_filter).toEqual([{ field: 'a', operator: 'AND', value: 1 }]);
  });
});
