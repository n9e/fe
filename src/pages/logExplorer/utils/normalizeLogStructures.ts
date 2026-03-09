import _ from 'lodash';

interface Log {
  [key: string]: string | number | boolean | object | null;
}

export default function normalizeLogStructures(log: Log): Log {
  const normalizedLog: Log = {};
  _.forEach(log, (value, key) => {
    if (_.isString(value) && (_.startsWith(value, '{') || _.startsWith(value, '['))) {
      const valToObj = _.attempt(JSON.parse.bind(null, value));
      if (_.isError(valToObj)) {
        console.warn('parse log value to object error: ', key, valToObj);
        normalizedLog[key] = value;
      } else {
        normalizedLog[key] = valToObj;
      }
    } else {
      normalizedLog[key] = value;
    }
  });
  return normalizedLog;
}
