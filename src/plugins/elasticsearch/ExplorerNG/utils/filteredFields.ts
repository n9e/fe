import _ from 'lodash';

export function filterOutBuiltinFields(fields: string[]) {
  return _.filter(fields, (item) => {
    if (_.includes(['__n9e_id_n9e__', '__n9e_raw_n9e__'], item)) {
      return false;
    }
    return true;
  });
}

export default function filteredFields(fields: string[], organizeFields: string[]) {
  const filtered = _.filter(filterOutBuiltinFields(fields), (item) => {
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
