/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { render, screen, waitFor } from '@testing-library/react';

import QueryOptions from './QueryOptions';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// TimeRangePicker 依赖 @/App 等重模块，且与摘要展示逻辑无关，按仓库既有约定 mock
jest.mock('@/components/TimeRangePicker', () => {
  const TimeRangePickerMock = () => null;
  return {
    __esModule: true,
    default: TimeRangePickerMock,
    isMathString: (value: string) => /^now/.test(value),
    // 返回固定标记，用于证明摘要展示的是 describeTimeRange 的输出
    describeTimeRange: jest.fn((range: { start: string; end: string }, dateFormat: string) => `formatted:${dateFormat}:${range.start}~${range.end}`),
  };
});

function renderQueryOptions(values: Record<string, unknown>) {
  function Harness() {
    const [form] = Form.useForm();
    React.useEffect(() => {
      form.setFieldsValue(values);
    }, []);
    return (
      <Form form={form}>
        <QueryOptions panelWidth={240} />
      </Form>
    );
  }
  return render(<Harness />);
}

const getMockedDescribeTimeRange = () => {
  const mocked = jest.requireMock('@/components/TimeRangePicker') as { describeTimeRange: jest.Mock };
  return mocked.describeTimeRange;
};

describe('dashboard QueryOptions 按钮右侧摘要', () => {
  beforeEach(() => {
    getMockedDescribeTimeRange().mockClear();
  });

  it('未设置任何选项时不显示摘要', () => {
    renderQueryOptions({});
    expect(screen.queryByText(/query\.options_max_data_points:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/query\.options_time:/)).not.toBeInTheDocument();
    expect(getMockedDescribeTimeRange()).not.toHaveBeenCalled();
  });

  it('设置 maxDataPoints 时展示摘要', async () => {
    renderQueryOptions({ maxDataPoints: 100 });
    await waitFor(() => {
      expect(screen.getByText(/query\.options_max_data_points: 100/)).toBeInTheDocument();
    });
  });

  it('设置 queryOptionsTime 时用 describeTimeRange 格式化后展示', async () => {
    const range = { start: 'now-1h', end: 'now' };
    renderQueryOptions({ queryOptionsTime: range });
    await waitFor(() => {
      // 摘要文本来自 mock 的 describeTimeRange 输出
      expect(screen.getByText(/query\.options_time: formatted:YYYY-MM-DD HH:mm:ss:now-1h~now/)).toBeInTheDocument();
    });
    // 应携带查询时间范围与日期格式调用 describeTimeRange
    expect(getMockedDescribeTimeRange()).toHaveBeenCalledWith(range, 'YYYY-MM-DD HH:mm:ss');
  });

  it('同时设置时用分隔符组合展示', async () => {
    renderQueryOptions({
      maxDataPoints: 100,
      queryOptionsTime: { start: '2025-01-01 00:00:00', end: '2025-01-02 00:00:00' },
    });
    await waitFor(() => {
      expect(
        screen.getByText(/query\.options_max_data_points: 100 · query\.options_time: formatted:YYYY-MM-DD HH:mm:ss:2025-01-01 00:00:00~2025-01-02 00:00:00/),
      ).toBeInTheDocument();
    });
    expect(getMockedDescribeTimeRange()).toHaveBeenCalled();
  });
});
