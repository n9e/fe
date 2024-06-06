export const defaultFont: any = {
  fontWeight: 'normal',
  fontSize: '12px',
  fontFamily: 'Helvetica Neue,sans-serif,PingFangSC-Regular,microsoft yahei ui,microsoft yahei,simsun,"sans-serif"',
};

export const getFontStr = (font = defaultFont) => {
  return `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
};

export default function getTextWidth(text: string, font = getFontStr()) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
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
