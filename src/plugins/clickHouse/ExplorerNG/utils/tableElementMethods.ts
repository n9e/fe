export function scrollToTop(logsAntdTableSelector: string, logsRgdTableSelector: string) {
  const antdTableEleNodes = document.querySelector(logsAntdTableSelector);
  const rgdTableEleNodes = document.querySelector(logsRgdTableSelector);
  if (antdTableEleNodes) {
    antdTableEleNodes?.scrollTo(0, 0);
  } else if (rgdTableEleNodes) {
    rgdTableEleNodes?.scrollTo(0, 0);
  }
}

export function getIsAtBottom(logsAntdTableSelector: string, logsRgdTableSelector: string) {
  const antdTableEleNodes = document.querySelector(logsAntdTableSelector);
  const rgdTableEleNodes = document.querySelector(logsRgdTableSelector);
  let isAtBottom = false;
  if (antdTableEleNodes) {
    isAtBottom = antdTableEleNodes && antdTableEleNodes?.scrollHeight - (Math.round(antdTableEleNodes?.scrollTop) + antdTableEleNodes?.clientHeight) <= 1;
  } else if (rgdTableEleNodes) {
    isAtBottom = rgdTableEleNodes && rgdTableEleNodes?.scrollHeight - (Math.round(rgdTableEleNodes?.scrollTop) + rgdTableEleNodes?.clientHeight) <= 1;
  }
  return isAtBottom;
}
