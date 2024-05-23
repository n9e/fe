import _ from 'lodash';

export const formatBeautifyJson = (json: string, type = 'string') => {
  try {
    const parsed = JSON.parse(json);
    if (type === 'array') {
      return JSON.stringify([JSON.parse(json)], null, 4);
    }
    return JSON.stringify(parsed, null, 4);
  } catch (e) {
    return json;
  }
};

export const formatBeautifyJsons = (jsons: string[]) => {
  try {
    const parsed = _.map(jsons, (item) => JSON.parse(item));
    return JSON.stringify(parsed, null, 4);
  } catch (e) {
    return _.toString(jsons);
  }
};
