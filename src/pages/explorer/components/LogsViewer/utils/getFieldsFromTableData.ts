import _ from 'lodash';

export default function getFieldsFromTableData(data: { [index: string]: any }[]) {
  let fields: string[] = [];
  _.forEach(data, (item) => {
    fields = _.union(fields, _.keys(item));
  });
  return fields;
}
