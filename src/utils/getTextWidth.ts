import { FONT_FAMILY } from '@/utils/constant';

export const defaultFont: any = {
  fontWeight: 'normal',
  fontSize: '12px',
  fontFamily: FONT_FAMILY,
};

export const getFontStr = (font = defaultFont) => {
  return `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
};

export default function getTextWidth(text: string, font = {}) {
  const bodyFontWeight = window.getComputedStyle(document.body).fontWeight;
  const bodyFontSize = window.getComputedStyle(document.body).fontSize;
  const bodyFont = window.getComputedStyle(document.body).fontFamily;
  const curFont = {
    fontWeight: bodyFontWeight,
    fontSize: bodyFontSize,
    fontFamily: bodyFont,
    ...font,
  };
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.font = getFontStr(curFont);
  const metrics = context.measureText(text);
  return Math.ceil(metrics.width);
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
