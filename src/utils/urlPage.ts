import queryString from 'query-string';

// 从 URL search 中读取页码（?page=N），缺省/非法时回退到 1
export function getPageFromSearch(search: string): number {
  const parsed = queryString.parse(search);
  const page = Array.isArray(parsed.page) ? parsed.page[0] : parsed.page;
  const num = Number(page);
  return Number.isInteger(num) && num > 0 ? num : 1;
}

// 在现有 search 上设置/更新 page 参数，保留其余参数（幂等）
export function setPageInSearch(search: string, page: number): string {
  const parsed = queryString.parse(search);
  return queryString.stringify({ ...parsed, page });
}

// 从 search 中移除 page 参数，保留其余参数（幂等）
export function removePageFromSearch(search: string): string {
  const parsed = queryString.parse(search);
  delete parsed.page;
  return queryString.stringify(parsed);
}
