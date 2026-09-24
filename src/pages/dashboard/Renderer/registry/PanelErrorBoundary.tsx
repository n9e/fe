import React from 'react';

interface Props {
  children: React.ReactNode;
  /** 变化时清除已捕获的错误，用于面板切换或类型变更后重新渲染 */
  resetKey?: string;
  /** 将渲染错误交给面板标题栏统一展示。 */
  onError?: (error?: Error) => void;
}

interface State {
  error?: Error;
  /** 重挂载计数，作为 children 的 key 在配置变化后重建图表实例 */
  attempt: number;
}

/**
 * 面板级错误边界：单个图表渲染失败时只影响该面板，不拖垮整个仪表盘。
 *
 * `resetKey` 变化（例如切换面板类型）时清除错误并重建子树。
 */
export default class PanelErrorBoundary extends React.Component<Props, State> {
  state: State = { attempt: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.props.onError?.(undefined);
      this.setState({ error: undefined, attempt: this.state.attempt + 1 });
    }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) {
      return null;
    }
    return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
  }
}
