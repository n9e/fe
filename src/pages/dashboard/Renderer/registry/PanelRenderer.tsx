import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IType } from '../../types';
import { getPanelTypeDefinition } from './index';
import PanelErrorBoundary from './PanelErrorBoundary';
import type { PanelChartProps } from './types';

/**
 * 按面板类型渲染图表。
 *
 * - 未知类型保持历史提示文案（`detail.invalidPanelType`），不抛错也不静默；
 * - 每个面板外层包裹局部错误边界，单图崩溃不影响其他面板；
 * - `resetKey` 绑定面板与类型，切换类型或重新指定面板后重新渲染。
 */
export default function PanelRenderer({ type, ...chartProps }: PanelChartProps & { type: IType }) {
  const { t } = useTranslation('dashboard');
  const definition = getPanelTypeDefinition(type);

  if (!definition) {
    return <div className='unknown-type'>{`${t('detail.invalidPanelType')} ${type}`}</div>;
  }

  const Chart = definition.chart;

  return (
    <PanelErrorBoundary resetKey={`${chartProps.values.id}:${type}`}>
      <Chart {...chartProps} />
    </PanelErrorBoundary>
  );
}
