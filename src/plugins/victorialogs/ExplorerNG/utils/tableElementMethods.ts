export function getIsAtBottom(antdTableSelector: string, rgdTableSelector: string) {
  const antdTableBody = document.querySelector(antdTableSelector);
  const rgdTable = document.querySelector(rgdTableSelector);
  const target = antdTableBody || rgdTable;
  if (!target) return false;
  return target.scrollTop + target.clientHeight >= target.scrollHeight - 10;
}

export function scrollToTop(antdTableSelector: string, rgdTableSelector: string) {
  const antdTableBody = document.querySelector(antdTableSelector);
  const rgdTable = document.querySelector(rgdTableSelector);
  const target = antdTableBody || rgdTable;
  if (target) {
    target.scrollTop = 0;
  }
}
