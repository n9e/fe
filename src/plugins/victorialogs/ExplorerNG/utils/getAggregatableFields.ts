import _ from 'lodash';

import { FieldNameSuggestion, VictoriaLogsAggregation } from '../types';

const numberLikeFunctions: VictoriaLogsAggregation['func'][] = ['sum', 'avg', 'min', 'max', 'quantile'];

export default function getAggregatableFields(fields: FieldNameSuggestion[], func?: VictoriaLogsAggregation['func']) {
  if (!func || func === 'count' || func === 'count_uniq') return fields;
  if (_.includes(numberLikeFunctions, func)) return _.filter(fields, (field) => field.type === 'number' || field.type === 'unknown' || !field.type);
  return fields;
}
