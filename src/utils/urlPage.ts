import queryString from 'query-string';

// 从 URL search 中读取页码，缺省/非法时回退到 1
export function getPageFromSearch(search: string, pageKey = 'page'): number {
  const parsed = queryString.parse(search);
  const pageValue = parsed[pageKey];
  const page = Array.isArray(pageValue) ? pageValue[0] : pageValue;
  const num = Number(page);
  return Number.isInteger(num) && num > 0 ? num : 1;
}

// 在现有 search 上设置/更新页码参数，保留其余参数（幂等）
export function setPageInSearch(search: string, page: number, pageKey = 'page'): string {
  const parsed = queryString.parse(search);
  return queryString.stringify({ ...parsed, [pageKey]: page });
}

// 从 search 中移除页码参数，保留其余参数（幂等）
export function removePageFromSearch(search: string, pageKey = 'page'): string {
  const parsed = queryString.parse(search);
  delete parsed[pageKey];
  return queryString.stringify(parsed);
}
