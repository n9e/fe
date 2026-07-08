import _ from 'lodash';

import { FilterType } from '../types';

export default function getRequestParamsByFilter(filter: FilterType) {
  const params = Object.assign(
    { range: filter.range },
    !_.isEmpty(filter.datasource_ids) ? { datasource_ids: _.join(filter.datasource_ids, ',') } : {},
    !_.isEmpty(filter.severity) ? { severity: _.join(filter.severity, ',') } : {},
    filter.query ? { query: filter.query } : {},
    filter.bgid ? { bgid: filter.bgid } : {},
    !_.isEmpty(filter.rule_prods) ? { rule_prods: _.join(filter.rule_prods, ',') } : {},
    !_.isEmpty(filter.event_ids) ? { event_ids: filter.event_ids } : {}, // 保留数组，随 POST 请求体下发（不再拼接进 URL）
    filter.my_groups ? { my_groups: filter.my_groups === 'true' } : {},
  );
  return params;
}
