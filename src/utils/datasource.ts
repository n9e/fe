import _ from 'lodash';

export const getDefaultDatasourceValue = (datasourceCate: string, datasourceList: { [index: string]: { id: number; name: string }[] }) => {
  const localValue = localStorage.getItem(`datasourceValue_${datasourceCate}`);
  let defaultValue = _.get(datasourceList, [datasourceCate, 0, 'id']);
  if (!localValue) {
    return defaultValue;
  }
  const valueToNumber = _.toNumber(localValue);
  const isExist = _.find(datasourceList[datasourceCate], (item) => item.id === valueToNumber);
  if (isExist) {
    return valueToNumber;
  }
  return defaultValue;
};

export const setDefaultDatasourceValue = (datasourceCate, value) => {
  localStorage.setItem(`datasourceValue_${datasourceCate}`, value);
};
