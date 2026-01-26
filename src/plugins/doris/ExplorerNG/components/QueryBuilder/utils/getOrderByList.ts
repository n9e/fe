import _ from 'lodash';

import { Field, AggregateConfig } from '../../../types';
import getAliasListByAggregates from './getAliasListByAggregates';

export default function getOrderByList(indexData: Field[], aggregates: AggregateConfig[], group_by: string[]): string[] {
  if (_.isEmpty(aggregates) && _.isEmpty(group_by)) {
    return _.map(indexData, (item) => item.field);
  }
  const aliasList = getAliasListByAggregates(aggregates);
  return _.concat(aliasList, group_by);
}
