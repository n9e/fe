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
    filter.my_groups ? { my_groups: filter.my_groups === 'true' } : {},
  );
  return params;
}
