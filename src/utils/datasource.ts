import _ from 'lodash';

export const getDefaultDatasourceValue = (datasourceCate: string, groupedDatasourceList: { [index: string]: { id: number; name: string; is_default: boolean }[] }) => {
  const localValue = localStorage.getItem(`datasourceValue_${datasourceCate}`);
  const datasourceList = _.get(groupedDatasourceList, datasourceCate, []);
  let defaultValue = _.get(datasourceList, [0, 'id']);
  if (!localValue) {
    const isDefaultDatasource = _.find(datasourceList, (item) => !!item.is_default);
    if (isDefaultDatasource) {
      defaultValue = isDefaultDatasource.id;
    }
    return defaultValue;
  }
  const valueToNumber = _.toNumber(localValue);
  const isExist = _.find(datasourceList, (item) => item.id === valueToNumber);
  if (isExist) {
    return valueToNumber;
  }
  return defaultValue;
};

export const setDefaultDatasourceValue = (datasourceCate, value) => {
  localStorage.setItem(`datasourceValue_${datasourceCate}`, value);
};
