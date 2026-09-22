import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';

/** 单个面板的渲染错误占位，附带重试入口。 */
function PanelErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const { t } = useTranslation('dashboard');
  return (
    <div className='flex h-full flex-col items-center justify-center gap-2 text-center' role='alert' data-testid='panel-render-error'>
      <WarningOutlined />
      <div>{t('detail.panelRenderFailed', { defaultValue: '面板渲染失败' })}</div>
      <div className='max-w-full break-all opacity-60'>{error.message}</div>
      <Button size='small' icon={<ReloadOutlined />} onClick={onRetry}>
        {t('detail.retry', { defaultValue: '重试' })}
      </Button>
    </div>
  );
}

interface Props {
  children: React.ReactNode;
  /** 变化时清除已捕获的错误，用于面板切换或类型变更后重新渲染 */
  resetKey?: string;
}

interface State {
  error?: Error;
  /** 重试计数，作为 children 的 key 强制重建图表实例 */
  attempt: number;
}

/**
 * 面板级错误边界：单个图表渲染失败时只影响该面板，不拖垮整个仪表盘。
 *
 * 重试会清除错误并重建子树；`resetKey` 变化（例如切换面板类型）时同样清除错误。
 */
export default class PanelErrorBoundary extends React.Component<Props, State> {
  state: State = { attempt: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: undefined, attempt: this.state.attempt + 1 });
    }
  }

  handleRetry = () => {
    this.setState((state) => ({ error: undefined, attempt: state.attempt + 1 }));
  };

  render() {
    if (this.state.error) {
      return <PanelErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }
    return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
  }
}
