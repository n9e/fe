/**
 * tsGraph 使用
 */
export type TsGraphThemeMode = 'light' | 'dark';

/** 与 variable.css --fc-text-3 同步（Canvas 无法使用 CSS 变量） */
const tsGraphAxisLabelColor: Record<TsGraphThemeMode, string> = {
  light: '#3f4856',
  dark: 'rgb(201, 201, 207)',
};

/** 与 variable.css --fc-red-9 同步 */
const tsGraphPlotLineColor: Record<TsGraphThemeMode, string> = {
  light: 'rgb(229, 72, 77)',
  dark: 'rgb(239, 67, 67)',
};

export const TS_GRAPH_AXIS_LABEL_FONT_SIZE = 11;

/** 与 App.less body font-family 一致，computed 不可用时兜底 */
const TS_GRAPH_AXIS_LABEL_FONT_FALLBACK = "'Inter', -apple-system, 'Noto Sans SC', 'Source Han Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', sans-serif";

function resolveAxisLabelFontFromElement(el?: HTMLElement | null) {
  if (typeof window === 'undefined') {
    return { fontFamily: TS_GRAPH_AXIS_LABEL_FONT_FALLBACK, fontWeight: '400' };
  }
  const target = el ?? document.body;
  const style = window.getComputedStyle(target);
  return {
    fontFamily: style.fontFamily || TS_GRAPH_AXIS_LABEL_FONT_FALLBACK,
    fontWeight: style.fontWeight || '400',
  };
}

/**
 * 轴标签字体与页面 DOM 对齐（Canvas 需 fontWeight + 与 body 相同的 font-family）。
 * @param container 图表容器，默认 document.body
 */
export function getTsGraphAxisLabels(mode: TsGraphThemeMode, container?: HTMLElement | null) {
  const { fontFamily, fontWeight } = resolveAxisLabelFontFromElement(container);
  return {
    fontSize: TS_GRAPH_AXIS_LABEL_FONT_SIZE,
    fontFamily,
    fontWeight,
    color: tsGraphAxisLabelColor[mode],
  };
}

/** Inter .woff2 异步加载完成后重绘，避免 Canvas 先用系统 fallback 字体 */
export function ensureTsGraphAxisFontsLoaded(fontSize = TS_GRAPH_AXIS_LABEL_FONT_SIZE) {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }
  return Promise.all([document.fonts.load(`400 ${fontSize}px Inter`), document.fonts.ready]).then(() => undefined);
}

export function redrawTsGraphAfterFontsReady(chart?: { draw: (redrawLegend?: boolean) => void } | null) {
  if (!chart) return;
  void ensureTsGraphAxisFontsLoaded().then(() => chart.draw(false));
}

export function getTsGraphPlotLineColor(mode: TsGraphThemeMode) {
  return tsGraphPlotLineColor[mode];
}

export const tsGraphThemeColor = {
  xAxis: {
    lineColor: {
      light: '#ccc',
      dark: 'rgba(204, 204, 220, 0.2)',
    },
    tickColor: {
      light: '#ccc',
      dark: 'rgba(204, 204, 220, 0.2)',
    },
  },
  yAxis: {
    /**
     * 跟随 "--fc-fill-2" 及时更新
     */
    backgroundColor: {
      light: '#fff',
      dark: 'rgb(22 22 24)',
    },
    gridLineColor: {
      light: 'rgb(243,244,246)',
      dark: 'rgba(153, 153, 165, 0.08)',
    },
  },
};

/**
 * 灭火图首页气泡 特殊处理
 */
export const bubbleIcon = {
  bubbleImage: {
    red: {
      light: '/image/outfire/status-bubble/red_bubble_light.png',
      dark: '/image/outfire/status-bubble/red_bubble_dark.png',
    },
    green: {
      light: '/image/outfire/status-bubble/green_bubble_light.png',
      dark: '/image/outfire/status-bubble/green_bubble_dark.png',
    },
    nodata: {
      light: '/image/outfire/status-bubble/nodata_bubble_light.png',
      dark: '/image/outfire/status-bubble/nodata_bubble_dark.png',
    },
  },
};

/**
 * 灭火图首页自定义图标状态颜色
 */
export const firemapLevel1Icon = {
  red: {
    light: '#E33639',
    dark: '#F65B5D',
  },
  green: {
    light: '#51C061',
    dark: '#6EDB7D',
  },
  nodata: {
    light: '#9793A9',
    dark: '#B0ACC2',
  },
};
