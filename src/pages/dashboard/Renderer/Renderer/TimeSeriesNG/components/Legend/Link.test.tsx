/** @jest-environment jsdom */

import React from 'react';
import { render } from '@testing-library/react';

jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => {
  const { useGlobalState } = require('@/pages/dashboard/globalState');

  return {
    /** 模拟真实 Hook 对所属仪表盘运行时的严格依赖，防止外部复用遗漏 Provider。 */
    useReplaceTemplateVariables: () => {
      const [variables] = useGlobalState('variablesWithOptions');
      return (value: string) => `${value}&variables=${variables.length}`;
    },
  };
});

import type { DataItem } from '../../utils/getLegendData';

import Link from './Link';

/** 构造图例链接所需的最小序列数据，覆盖仪表盘外部复用入口。 */
function createLegendData(): DataItem {
  return {
    id: 'series-1',
    name: 'cpu_usage',
    metric: {
      host: 'node-1',
    },
    min: { value: 0, text: '0' },
    max: { value: 1, text: '1' },
    avg: { value: 0.5, text: '0.5' },
    last: { value: 1, text: '1', stat: 1 },
    sum: { value: 1, text: '1' },
    color: '#1677ff',
    show: true,
  };
}

describe('Legend Link', () => {
  it('renders from an explorer without inheriting a dashboard runtime provider', () => {
    const { container } = render(<Link data={createLegendData()} name='详情' url='/detail?host=$__field.labels.host' />);

    expect(container.querySelector('[data-icon="link"]')).toBeInTheDocument();
  });
});
