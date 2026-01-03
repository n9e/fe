import _ from 'lodash';

interface FormValue {
  datasourceCate: string;
  datasourceValue: number;
  query: {
    [index: string]: any;
  };
}

export default function formValuesIsInItems(
  formValues: FormValue,
  items: {
    key: string;
    isInited?: boolean;
    formValues?: FormValue;
  }[],
): boolean {
  return _.some(items, (item: any) => {
    const itemFormValues = item.formValues;
    if (itemFormValues?.datasourceCate === formValues.datasourceCate && itemFormValues?.datasourceValue === formValues.datasourceValue) {
      // sls、cls、loki 存在 query.query，如果 formValues.query.query 存在则也需要比较 query.query，否则排除 query.query 后比较
      if (formValues.query.query !== undefined) {
        return _.isEqual(_.omit(itemFormValues?.query, ['range']), _.omit(formValues.query, ['range']));
      }
      if (formValues.datasourceCate === 'es') {
        // es数据源区分index和indexPattern，无法严格equal，所以以缓存中的formValues.query中的keys为标准，逐个对比是否相等
        const omitedFormValuesQuery = _.omit(formValues.query, ['query', 'range']);
        const keys = _.keys(omitedFormValuesQuery);
        const pickedKeysItemFormValues = _.pick(itemFormValues?.query, keys);
        return _.isEqual(pickedKeysItemFormValues, omitedFormValuesQuery);
      }
      return _.isEqual(_.omit(itemFormValues?.query, ['query', 'range', 'index', 'date_field']), _.omit(formValues.query, ['query', 'range', 'index', 'date_field']));
    }
  });
}
