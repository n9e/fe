import { RequestMethod } from '@/store/common';
import request from '@/utils/request';

import { getESContextLogs } from './services';

jest.mock('@/utils/constant', () => ({
  N9E_PATHNAME: 'n9e-plus',
  DatasourceCateEnum: { elasticsearch: 'elasticsearch', doris: 'doris' },
}));
jest.mock('@fc-components/es-query', () => ({ buildESQueryFromKuery: jest.fn(() => ({ filter: [] })) }));
jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn() }));

const mockedRequest = request as unknown as jest.Mock;

const page = {
  logs: [{ __index_number__: 0, message: 'current' }],
  back_cursor: { seq: '99', time: '1700000000000', index: 0 },
  forward_cursor: { seq: '101', time: '1700000001000', index: 0 },
  has_back: true,
  has_forward: true,
  back_scan_limited: false,
  forward_scan_limited: false,
};

describe('getESContextLogs', () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it('posts the context query to the plus endpoint and unwraps dat', async () => {
    mockedRequest.mockResolvedValue({ dat: page });
    const data = {
      cate: 'elasticsearch',
      datasource_id: 1,
      query: [
        {
          stream_id: 's1',
          seq: '100',
          time: '1700000000000',
          cursor_index: 0,
          back_lines: 30,
          forward_lines: 30,
          index: 'logs-*',
          time_field: '@timestamp',
        },
      ],
    };

    await expect(getESContextLogs(data)).resolves.toEqual(page);
    expect(mockedRequest).toHaveBeenCalledWith('/api/n9e-plus/es-context-logs-query', { method: RequestMethod.Post, data });
  });
});
