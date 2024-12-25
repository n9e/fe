import _ from 'lodash';

export const getSerieName = (metric: Object, ref?: string) => {
  let name = metric['__name__'] || '';
  _.forEach(_.omit(metric, '__name__'), (value, key) => {
    name += ` ${key}: ${value}`;
  });
  name = _.trim(name);
  if (ref) {
    name = `${ref} ${name}`;
  }
  return name;
};
