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
// 字宽差异，导致 uPlot Y 轴等基于文字宽度计算的布局被剪切。
let measureCanvas: HTMLCanvasElement | null = null;
function getMeasureContext(): CanvasRenderingContext2D {
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
    measureCanvas.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:0;height:0;pointer-events:none;';
    document.body.appendChild(measureCanvas);
  }
  return measureCanvas.getContext('2d') as CanvasRenderingContext2D;
}

export default function getTextWidth(text: string, font = getFontStr()) {
  const context = getMeasureContext();
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
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
