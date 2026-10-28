export interface SeriesTooltipParams {
  /** serie 的标签 */
  metrics?: Record<string, string | number | undefined | null>;
  /** 自定义 legend，存在时替代 metrics 展示 */
  legend?: string;
  /** serie 的值（已格式化） */
  value?: number | string;
}

export interface SeriesTooltipContent {
  title?: string;
  value?: string;
  labels: Array<{ key: string; value: string }>;
}

export const SERIES_TOOLTIP_CLASS = 'n9e-series-tooltip';

export function getSeriesTooltipContent({ metrics, legend, value }: SeriesTooltipParams): SeriesTooltipContent {
  const valueText = value == null || value === '' ? undefined : String(value);
  if (legend) {
    return { title: legend, value: valueText, labels: [] };
  }

  const labels: SeriesTooltipContent['labels'] = [];
  let title: string | undefined;
  Object.entries(metrics ?? {}).forEach(([key, labelValue]) => {
    if (labelValue == null) return;
    if (key === '__name__') {
      title = String(labelValue);
      return;
    }
    labels.push({ key, value: String(labelValue) });
  });

  return { title, value: valueText, labels };
}

export function hasSeriesTooltipContent(content: SeriesTooltipContent) {
  return Boolean(content.title || content.value || content.labels.length);
}

/**
 * 原生 DOM 版本，供无法渲染 React 组件的场景（如图表库的 tooltip 回调）使用。
 * 没有可展示的内容时返回 null。
 */
export function createSeriesTooltipElement(params: SeriesTooltipParams): HTMLDivElement | null {
  const content = getSeriesTooltipContent(params);
  if (!hasSeriesTooltipContent(content)) return null;

  const root = document.createElement('div');
  root.className = SERIES_TOOLTIP_CLASS;

  if (content.title || content.value) {
    const header = document.createElement('div');
    header.className = `${SERIES_TOOLTIP_CLASS}-header`;
    if (content.title) {
      const titleNode = document.createElement('span');
      titleNode.className = `${SERIES_TOOLTIP_CLASS}-title`;
      titleNode.textContent = content.title;
      header.appendChild(titleNode);
    }
    if (content.value) {
      const valueNode = document.createElement('span');
      valueNode.className = `${SERIES_TOOLTIP_CLASS}-value`;
      valueNode.textContent = content.value;
      header.appendChild(valueNode);
    }
    root.appendChild(header);
  }

  if (content.labels.length) {
    const list = document.createElement('ul');
    list.className = `${SERIES_TOOLTIP_CLASS}-labels`;
    content.labels.forEach(({ key, value }) => {
      const item = document.createElement('li');
      item.textContent = `${key}: ${value}`;
      list.appendChild(item);
    });
    root.appendChild(list);
  }

  return root;
}
