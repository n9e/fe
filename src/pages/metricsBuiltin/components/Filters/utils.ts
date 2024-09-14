import _ from 'lodash';
import { escapePromQLString } from '@/pages/dashboard/VariableConfig/utils';

export function filtersToStr(
  filters: {
    label: string;
    oper: '=' | '=~' | '!=' | '!~';
    value: string;
  }[],
) {
  const arr = _.compact(
    _.map(filters, (item) => {
      if (item.label && item.value) {
        return `${item.label}${item.oper}"${item.value}"`;
      }
      return '';
    }),
  );
  const str = _.join(
    _.compact(
      _.map(arr, (item) => {
        return escapePromQLString(item);
      }),
    ),
    ',',
  );
  return str ? `{${str}}` : '';
}
