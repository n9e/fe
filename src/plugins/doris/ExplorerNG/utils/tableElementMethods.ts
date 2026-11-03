import { getExternalLogScroll, isExternalLogAtBottom } from '@/pages/logExplorer/components/LogsViewer/utils/scrollParent';
/** Reset the actual results scroll owner, falling back to standalone table scrolling. */
export function scrollToTop(logsAntdTableSelector: string, logsRgdTableSelector: string) {
  const external = getExternalLogScroll(document.querySelector(logsAntdTableSelector) || document.querySelector(logsRgdTableSelector));
  if (external) {
    external.parent.scrollTo({ top: 0 });
    return;
  }

  const antdTableEleNodes = document.querySelector(logsAntdTableSelector);
  const rgdTableEleNodes = document.querySelector(logsRgdTableSelector);
  if (antdTableEleNodes) {
    antdTableEleNodes?.scrollTo(0, 0);
  } else if (rgdTableEleNodes) {
    rgdTableEleNodes?.scrollTo(0, 0);
  }
}

/** Use visible external results bounds, preserving legacy table-height checks. */
export function getIsAtBottom(logsAntdTableSelector: string, logsRgdTableSelector: string) {
  const externalBottom = isExternalLogAtBottom(document.querySelector(logsAntdTableSelector) || document.querySelector(logsRgdTableSelector));
  if (externalBottom !== undefined) return externalBottom;

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
