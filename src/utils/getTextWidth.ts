import { FONT_FAMILY } from '@/utils/constant';

export const defaultFont: any = {
  fontWeight: 'normal',
  fontSize: '12px',
  fontFamily: FONT_FAMILY,
};

export const getFontStr = (font = defaultFont) => {
  return `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
};

// 测量 canvas 必须挂在 DOM 内才能继承全局 CSS（如 antd 设置的
// font-feature-settings: 'tnum'），否则 measureText 与实际渲染会存在
// 字宽差异，导致基于文字宽度计算的布局被剪切。
let measureCanvas: HTMLCanvasElement | null = null;
function getMeasureContext(): CanvasRenderingContext2D | null {
  try {
    if (!measureCanvas) {
      measureCanvas = document.createElement('canvas');
      measureCanvas.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:0;height:0;pointer-events:none;';
      document.body.appendChild(measureCanvas);
    }
    return measureCanvas.getContext('2d');
  } catch {
    return null;
  }
}

// 测量字体样式；调用方可能只覆盖其中若干项，缺省项回落到 body 计算样式。
interface TextFontStyle {
  fontWeight?: string | number;
  fontSize?: string | number;
  fontFamily?: string;
}

// 按字符估算文本宽度（em）：ASCII 记 0.65，其余字符（中文等）记 1。
export function getTextWidthInEm(text: string) {
  return Array.from(text).reduce((total, char) => total + (char.codePointAt(0)! > 0xff ? 1 : 0.65), 0);
}

function estimateTextWidth(text: string, font: TextFontStyle = {}) {
  // Canvas 不可用时按字符宽度估算，避免 jsdom 等环境因空 context 中断渲染。
  const fontSize = Number.parseFloat(String(font.fontSize ?? '12px')) || 12;
  return Math.ceil(getTextWidthInEm(text) * fontSize);
}

export function createTextWidthMeasurer(font: TextFontStyle = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !document.body) return null;

  let curFont: TextFontStyle;
  try {
    // 一批文本共用同一个测量器时，只解析一次 body 字体样式。
    const bodyStyle = window.getComputedStyle(document.body);
    curFont = {
      fontWeight: bodyStyle.fontWeight,
      fontSize: bodyStyle.fontSize,
      fontFamily: bodyStyle.fontFamily,
      ...font,
    };
  } catch {
    return null;
  }

  const context = getMeasureContext();
  return (text: string, overrides: TextFontStyle = {}) => {
    const resolvedFont = { ...curFont, ...overrides };
    if (!context) return estimateTextWidth(text, resolvedFont);

    try {
      context.font = getFontStr(resolvedFont);
      return Math.ceil(context.measureText(text).width);
    } catch {
      return estimateTextWidth(text, resolvedFont);
    }
  };
}

export default function getTextWidth(text: string, font: any = {}) {
  const measureTextWidth = createTextWidthMeasurer(font);
  return measureTextWidth ? measureTextWidth(text) : estimateTextWidth(text, font);
}

// 根据容器宽高计算出文本的最大字体大小
// 可能会有异常结果，某些字体不一定是标准格式
export const getMaxFontSize = (text: string, containerWidth: number, containerHeight: number, font = defaultFont) => {
  let fontSize = 1;
  let width = getTextWidth(text, getFontStr({ ...font, lineHeight: 1, fontSize: `${fontSize}px` }));
  while (width < containerWidth && fontSize < containerHeight) {
    fontSize++;
    width = getTextWidth(text, getFontStr({ ...font, lineHeight: 1, fontSize: `${fontSize}px` }));
  }
  return fontSize - 1;
};
