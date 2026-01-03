import _ from 'lodash';

export default function filteredFields(fields: string[], organizeFields: string[]) {
  return _.filter(fields, (item) => {
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
}
