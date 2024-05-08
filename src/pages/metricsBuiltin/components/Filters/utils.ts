import _ from 'lodash';

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
  const str = _.join(_.compact(arr), ',');
  return str ? `{${str}}` : '';
}
