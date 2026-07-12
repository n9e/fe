import _ from 'lodash';

export default function filteredFields(fields: string[], organizeFields: string[]) {
  const filtered = _.filter(fields, (item) => {
    if (_.includes(['__time', '__package_offset__', '___raw___', '___id___'], item)) {
      return false;
    }
    if (!_.isEmpty(organizeFields)) {
      let included = _.includes(organizeFields, item);
      if (!included) {
        const firstPart = item.split('.')[0];
        included = _.includes(organizeFields, firstPart);
      }
      return included;
    }
    return true;
  });

  // 如果 organizeFields 存在，根据其顺序排序
  if (!_.isEmpty(organizeFields)) {
    return _.sortBy(filtered, (item) => {
      const index = _.indexOf(organizeFields, item);
      if (index !== -1) {
        return index;
      }
      // 如果没有直接匹配，尝试匹配第一部分
      const firstPart = item.split('.')[0];
      const firstPartIndex = _.indexOf(organizeFields, firstPart);
      return firstPartIndex !== -1 ? firstPartIndex : organizeFields.length;
    });
  }

  return filtered;
}
