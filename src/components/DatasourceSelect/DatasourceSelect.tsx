import React, { useContext } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';

interface Props {
  value?: number[];
  onChange: (val?: number[]) => void;
  filterKey?: string;
  style?: React.CSSProperties;
}

export default function DatasourceSelect(props: Props) {
  const { t } = useTranslation();
  const { groupedDatasourceList, datasourceCateOptions, isPlus } = useContext(CommonStateContext);
  const { value, onChange, filterKey, style } = props;

  return (
    <Select
      showSearch
      style={style}
      maxTagCount='responsive'
      placeholder={t('common:datasource.id')}
      dropdownMatchSelectWidth={false}
      mode='multiple'
      optionFilterProp='label'
      options={_.map(
        _.omitBy(groupedDatasourceList, (_val, key) => {
          const result = _.find(datasourceCateOptions, (item) => {
            return item.value === key;
          });
          if (filterKey) {
            if (isPlus) {
              return !result?.[filterKey];
            }
            return !result?.[filterKey] || result?.alertPro;
          }
          return false;
        }),
        (val, key) => {
          return {
            label: key,
            options: _.map(val, (item) => {
              return {
                label: item.name,
                value: item.id,
              };
            }),
          };
        },
      )}
      value={value}
      onChange={onChange}
    />
  );
}
