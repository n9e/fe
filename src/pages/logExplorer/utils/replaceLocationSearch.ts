import queryString from 'query-string';
import { History } from 'history';

export default function replaceLocationSearch(params: {
  updatedQuery: { [key: string]: string | number | undefined | null }; // 更新后的查询参数
  location: Location;
  history: History;
  force?: boolean; // 是否强制替换当前页面记录
}) {
  const { updatedQuery, location, history, force } = params;
  const query = queryString.parse(location.search);

  if (force) {
    history.replace({
      pathname: location.pathname,
      search: queryString.stringify(updatedQuery),
    });
  } else {
    history.replace({
      pathname: location.pathname,
      search: queryString.stringify({ ...query, ...updatedQuery }),
    });
  }
}
