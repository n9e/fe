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
 * - `resetKey` 绑定面板、类型与数据版本：切换类型、重新指定面板或刷新出新数据后重新渲染，
 *   避免一次渲染异常让面板永久停留在空白态。
 */
export default function PanelRenderer({ type, onError, ...chartProps }: PanelChartProps & { type: IType; onError?: (error?: Error) => void }) {
  const { t } = useTranslation('dashboard');
  const definition = getPanelTypeDefinition(type);

  if (!definition) {
    return <div className='unknown-type'>{`${t('detail.invalidPanelType')} ${type}`}</div>;
  }

  const Chart = definition.chart;

  return (
    <PanelErrorBoundary resetKey={`${chartProps.values.id}:${type}:${chartProps.dataRevision ?? 0}`} onError={onError}>
      <Chart {...chartProps} />
    </PanelErrorBoundary>
  );
}
