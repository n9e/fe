import _ from 'lodash';

/**
 * prometheus 接口默认不会把 null 点返回
 * 会导致视觉上该时间点有数据存在的假象
 * 目前先前端处理补全断点
 */
export function completeBreakpoints(step: number | undefined, data: Array<[number, number | null]>) {
  // step 未提供时不会插入补点（原逻辑中 NaN < item[0] 恒为 false），直接返回原数据
  if (step === undefined) return data;
  const result: Array<[number, number | null]> = [];
  _.forEach(data, (item, idx) => {
    if (idx > 0) {
      const prev = result[result.length - 1];
      if (prev[0] + step < item[0]) {
        result.push([prev[0] + step, null]);
      }
    }
    result.push(item);
  });
  return result;
}

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
