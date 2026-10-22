import { getExternalLogScroll, isExternalLogAtBottom } from '@/pages/logExplorer/components/LogsViewer/utils/scrollParent';
/** Use visible external results bounds, preserving legacy table-height checks. */
export function getIsAtBottom(antdTableSelector: string, rgdTableSelector: string) {
  const externalBottom = isExternalLogAtBottom(document.querySelector(antdTableSelector) || document.querySelector(rgdTableSelector));
  if (externalBottom !== undefined) return externalBottom;

  const antdTableBody = document.querySelector(antdTableSelector);
  const rgdTable = document.querySelector(rgdTableSelector);
  const target = antdTableBody || rgdTable;
  if (!target) return false;
  return target.scrollTop + target.clientHeight >= target.scrollHeight - 10;
}

/** Reset the actual results scroll owner, falling back to standalone table scrolling. */
export function scrollToTop(antdTableSelector: string, rgdTableSelector: string) {
  const external = getExternalLogScroll(document.querySelector(antdTableSelector) || document.querySelector(rgdTableSelector));
  if (external) {
    external.parent.scrollTo({ top: 0 });
    return;
  }

  const antdTableBody = document.querySelector(antdTableSelector);
  const rgdTable = document.querySelector(rgdTableSelector);
  const target = antdTableBody || rgdTable;
  if (target) {
    target.scrollTop = 0;
  }
}
