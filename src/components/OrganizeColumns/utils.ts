import _ from 'lodash';

export const getDefaultColumnsConfigs = (defaultColumnsConfigs, LOCAL_STORAGE_KEY) => {
  const localColumnsConfigs = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (localColumnsConfigs) {
    try {
      defaultColumnsConfigs = _.map(defaultColumnsConfigs, (item) => {
        const localItem = _.find(JSON.parse(localColumnsConfigs), (i) => i.name === item.name);
        if (localItem) {
          item.visible = localItem.visible;
        }
        return item;
      });
    } catch (e) {
      console.error(e);
    }
  }
  return defaultColumnsConfigs;
};

export const setDefaultColumnsConfigs = (columnsConfigs, LOCAL_STORAGE_KEY) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(columnsConfigs));
};

export const ajustColumns = (columns, columnsConfigs) => {
  return _.filter(columns, (column) => {
    if (column.dataIndex === 'operator') return true;
    const config = _.find(columnsConfigs, (c) => c.name === column.dataIndex);
    return config ? config.visible : true;
  });
};
