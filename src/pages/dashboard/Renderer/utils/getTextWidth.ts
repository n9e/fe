export const defaultFont = {
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
