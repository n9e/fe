import _ from 'lodash';

import { getDefaultValue } from '@/components/TimeRangePicker';

import { TIME_CACHE_KEY, AGGR_RULE_ID, AGGR_RULE_CARD_EVENT_IDS_CACHE_KEY } from '../constants';
import { FilterType } from '../types';

export default function getFilterByURLQuery(query): FilterType {
  const localAggrRuleId = localStorage.getItem(AGGR_RULE_ID);
  const localeEventIds = localStorage.getItem(AGGR_RULE_CARD_EVENT_IDS_CACHE_KEY);

  return {
    range: getDefaultValue(TIME_CACHE_KEY, undefined),
    aggr_rule_id: localAggrRuleId ? Number(localAggrRuleId) : undefined,
    event_ids: localeEventIds ? _.split(localeEventIds, ',').map(Number) : undefined,
    datasource_ids: query.datasource_ids ? _.split(query.datasource_ids, ',').map(Number) : undefined,
    bgid: query.bgid ? Number(query.bgid) : undefined,
    severity: query.severity ? _.split(query.severity, ',').map(Number) : undefined,
    query: query.query ? query.query : undefined,
    is_recovered: query.is_recovered ? Number(query.is_recovered) : undefined,
    rule_prods: query.rule_prods ? _.split(query.rule_prods, ',') : [],
    my_groups: query.my_groups ? query.my_groups : 'true',
  };
}
