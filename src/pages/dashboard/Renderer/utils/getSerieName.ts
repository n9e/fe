import _ from 'lodash';
import replaceExpressionBracket from './replaceExpressionBracket';

// name 的处理逻辑为
// 1. 如果存在 valueField 则把 valueField 作为 __name__ 的值
// 2. 如果存在 legend 则通过 replaceExpressionBracket 转换 name
// 3. 如果存在 ref name 则为 ref + name

const getSerieName = (
  metric: { [index: string]: string | number },
  options?: {
    ref?: string;
    valueField?: string;
    legend?: string;
  },
) => {
  const { ref, valueField, legend } = options || {};
  let newMetric = _.cloneDeep(metric);
  if (valueField && valueField !== 'Value') {
    newMetric = {
      ..._.omit(newMetric, valueField),
      __name__: valueField,
    };
  }

  if (legend) {
    let name = replaceExpressionBracket(legend, newMetric);
    // 2024-07-23 注释以下逻辑， expression 也支持 legend，同时如果设置了 legend 则不再开头添加 ref
    // if (ref) {
    //   name = `${ref} ${name}`;
    // }
    return name;
  }

  let name = newMetric?.['__name__'] || '';
  _.forEach(_.omit(newMetric, '__name__'), (value, key) => {
    name += ` ${key}: ${value}`;
  });
  if (_.isString(name)) {
    name = _.trim(name);
  }
  if (ref) {
    name = `${ref} ${name}`;
  }
  return name;
};

export default getSerieName;
