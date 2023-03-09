import _ from 'lodash';

export const baseCates = [
  {
    value: 'prometheus',
    label: 'Prometheus',
    type: 'metric',
  },
  {
    value: 'elasticsearch',
    label: 'Elasticsearch',
    type: 'logging',
  },
];

export const AdvancedCates = [
  {
    value: 'aliyun-sls',
    label: '阿里云SLS',
    type: 'logging',
  },
];

const varCateMap = {
  VITE_IS_SLS_DS: 'aliyun-sls',
};

export const getAuthorizedDatasourceCates = () => {
  const datasourceCates = [...baseCates];
  _.forEach(import.meta.env, (value, key) => {
    if (_.endsWith(key, '_DS') && value === 'true') {
      const cate = varCateMap[key];
      if (cate) {
        datasourceCates.push({
          value: cate,
          label: _.find(AdvancedCates, { value: cate })?.label!,
          type: _.find(AdvancedCates, { value: cate })?.type!,
        });
      }
    }
  });
  return datasourceCates;
};
