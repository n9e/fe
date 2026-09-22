import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { LineChartOutlined, ReloadOutlined } from '@ant-design/icons';

import { createLazyComponent } from './lazyComponent';
import type { PanelChartAdapter, PanelChartProps } from './types';

/** 图表模块加载中的局部占位。 */
function PanelChartLoading() {
  const { t } = useTranslation('dashboard');
  return (
    <div className='flex h-full items-center justify-center' role='status' aria-label={t('common:loading')} data-testid='panel-chart-loading'>
      <LineChartOutlined style={{ fontSize: 32, opacity: 0.18 }} />
    </div>
  );
}

/** 图表模块加载失败：给出原因与重试入口。 */
function PanelChartLoadError({ error, onRetry }: { error: string; onRetry: () => void }) {
  const { t } = useTranslation('dashboard');
  return (
    <div className='flex h-full flex-col items-center justify-center gap-2 text-center' role='alert' data-testid='panel-chart-load-error'>
      <div>{t('detail.chartLoadFailed', { defaultValue: '图表加载失败' })}</div>
      <div className='max-w-full break-all opacity-60'>{error}</div>
      <Button size='small' icon={<ReloadOutlined />} onClick={onRetry}>
        {t('detail.retry', { defaultValue: '重试' })}
      </Button>
    </div>
  );
}

/**
 * 把低频图表的动态加载包装成普通适配组件，供注册表统一渲染。
 *
 * 加载中显示占位，失败显示可重试的局部错误态；详见 `createLazyComponent`。
 *
 * @param load 返回图表模块的加载器，必须能被重复调用（失败重试会再次执行）。
 */
export function lazyPanelChart(load: () => Promise<{ default: React.ComponentType<PanelChartProps> }>): PanelChartAdapter {
  return createLazyComponent<PanelChartProps>(load, { Loading: PanelChartLoading, Error: PanelChartLoadError });
}
