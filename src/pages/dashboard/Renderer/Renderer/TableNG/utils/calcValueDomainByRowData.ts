import _ from 'lodash';

export default function calcValueDomainByRowData(field: string, rowData: { [key: string]: any }[]): [number, number] {
  const values = _.filter(
    _.map(rowData, (row) => row[field]),
    (value) => {
      const val = _.toNumber(value);
      return _.isNumber(val) && !_.isNaN(val);
    },
  );
  if (values.length === 0) {
    return [0, 100];
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  return [min, max];
}
