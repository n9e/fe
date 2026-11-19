import { RequestMethod } from '@/store/common';
import request from '@/utils/request';

import { getNorthstarBusinessWorkspaceMapping } from './services';

jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn() }));

const mockedRequest = request as unknown as jest.Mock;

describe('getNorthstarBusinessWorkspaceMapping', () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it('请求北极星业务线 → 空间映射并取出 data', async () => {
    const mapping = [
      { business_id: 24, workspace_id: 99 },
      { business_id: 25, workspace_id: 100 },
    ] as const;
    mockedRequest.mockResolvedValue({ data: mapping });

    await expect(getNorthstarBusinessWorkspaceMapping()).resolves.toEqual(mapping);
    expect(mockedRequest).toHaveBeenCalledWith('/api/v1/northstar/business/workspace/mapping', {
      method: RequestMethod.Get,
      silence: true,
    });
  });

  it('接口没有 data 时回落到空数组', async () => {
    mockedRequest.mockResolvedValue({});
    await expect(getNorthstarBusinessWorkspaceMapping()).resolves.toEqual([]);

    mockedRequest.mockResolvedValue({ data: null });
    await expect(getNorthstarBusinessWorkspaceMapping()).resolves.toEqual([]);
  });
});
