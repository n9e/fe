import _ from 'lodash';

import { getDefaultValue } from '@/components/TimeRangePicker';

import { TIME_CACHE_KEY } from '../constants';

const getFilter = (query) => {
  return {
    range: getDefaultValue(TIME_CACHE_KEY, undefined),
    datasource_ids: query.datasource_ids ? _.split(query.datasource_ids, ',').map(Number) : [],
    bgid: query.bgid ? Number(query.bgid) : undefined,
    severity: query.severity ? Number(query.severity) : undefined,
    query: query.query ? query.query : undefined,
    is_recovered: query.is_recovered ? Number(query.is_recovered) : undefined,
    rule_prods: query.rule_prods ? _.split(query.rule_prods, ',') : [],
    rule_id: query.rule_id ? Number(query.rule_id) : undefined,
    event_ids: query.event_ids ? _.split(query.event_ids, ',') : [],
    my_groups: query.my_groups ? query.my_groups : undefined,
  };
};

export default getFilter;
