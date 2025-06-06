import _ from 'lodash';

export function getSqlByQuery(query: string) {
  const sql = _.split(query, '|')[1];
  return _.replace(sql, /\[[^\]*]\]/g, '');
}

export function getFields(logs, query) {
  const parser = new (window as any).NodeSQLParser.Parser();
  let ast: any;
  try {
    ast = parser.astify(getSqlByQuery(query));
  } catch (e) {
    console.error(e);
  }
  const fields = _.map(ast?.columns, (item) => {
    if (item.as) return item.as;
    return item?.expr?.column;
  });
  _.forEach(logs, (log) => {
    _.forEach(log, (_val, key) => {
      if (fields.indexOf(key) === -1 && key !== '__time__' && key !== '__source__') {
        fields.push(key);
      }
    });
  });
  return fields;
}
