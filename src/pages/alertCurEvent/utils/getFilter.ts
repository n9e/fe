import _ from 'lodash';

import { FilterType } from '../types';
import { MY_GRPUPS_CACHE_KEY } from '../constants';

export default function getFilterByURLQuery(query, range, aggrRuleCardEventIds): FilterType {
  const localeMyGroups = localStorage.getItem(MY_GRPUPS_CACHE_KEY);

  return {
    range,
    aggr_rule_id: query.aggr_rule_id ? Number(query.aggr_rule_id) : undefined,
    event_ids: aggrRuleCardEventIds,
    datasource_ids: query.datasource_ids ? _.split(query.datasource_ids, ',').map(Number) : undefined,
    bgid: query.bgid ? Number(query.bgid) : undefined,
    severity: query.severity ? _.split(query.severity, ',').map(Number) : undefined,
    query: query.query ? query.query : undefined,
    is_recovered: query.is_recovered ? Number(query.is_recovered) : undefined,
    rule_prods: query.rule_prods ? _.split(query.rule_prods, ',') : [],
    my_groups: query.my_groups ? query.my_groups : localeMyGroups ? localeMyGroups : 'false',
  };
}
