/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import HeaderActions from './HeaderActions';
import { getPayloadByUUID } from '../services';
import ImportDashboard from './Import';
import Export from '@/pages/dashboard/List/Export';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/App', () => {
  const React = require('react');
  return {
    CommonStateContext: React.createContext({ busiGroups: [{ id: 1, name: '默认业务组' }] }),
  };
});

jest.mock('../services', () => ({
  getPayloadByUUID: jest.fn(),
}));

jest.mock('./Import', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/pages/dashboard/List/Export', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedGetPayloadByUUID = getPayloadByUUID as jest.MockedFunction<typeof getPayloadByUUID>;
const mockedImportDashboard = ImportDashboard as jest.MockedFunction<typeof ImportDashboard>;
const mockedExport = Export as jest.MockedFunction<typeof Export>;

describe('模板仪表盘详情页操作', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('导入读取原始 payload，并阻止请求期间重复触发', async () => {
    let resolvePayload: (value: { content: string }) => void = () => {};
    mockedGetPayloadByUUID.mockReturnValue(
      new Promise((resolve) => {
        resolvePayload = resolve;
      }),
    );
    render(<HeaderActions uuid={101} />);

    const importButton = screen.getByLabelText('import_to_buisGroup');
    fireEvent.click(importButton);
    fireEvent.click(importButton);

    expect(mockedGetPayloadByUUID).toHaveBeenCalledTimes(1);
    expect(mockedGetPayloadByUUID).toHaveBeenCalledWith(101);

    await act(async () => {
      resolvePayload({ content: JSON.stringify({ name: 'CPU', configs: { panels: [] } }) });
    });

    await waitFor(() => {
      expect(mockedImportDashboard).toHaveBeenCalledWith({
        data: JSON.stringify({ name: 'CPU', configs: { panels: [] } }, null, 4),
        busiGroups: [{ id: 1, name: '默认业务组' }],
      });
    });
  });

  it('导出沿用列表的数组 JSON 格式', async () => {
    mockedGetPayloadByUUID.mockResolvedValue({ content: JSON.stringify({ name: 'CPU', configs: { panels: [] } }) });
    render(<HeaderActions uuid={102} />);

    fireEvent.click(screen.getByLabelText('common:btn.export'));

    await waitFor(() => {
      expect(mockedExport).toHaveBeenCalledWith({
        data: JSON.stringify([{ name: 'CPU', configs: { panels: [] } }], null, 4),
      });
    });
  });
});
