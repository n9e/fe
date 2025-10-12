import React, { useEffect, useContext } from 'react';
import { Select } from 'antd';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import { IVariable } from '../types';
import getValueByOptions from '../utils/getValueByOptions';
import stringToRegex from '../utils/stringToRegex';
import { Props } from './types';

export default function DatasourceIdentifier(props: Props) {
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { item, formatedRegex, variableValueFixed, onChange, value, setValue } = props;
  const { name, label, options } = item;
  const latestItemRef = React.useRef<IVariable>(item);

  useEffect(() => {
    latestItemRef.current = item;
  });

  useEffect(() => {
    const itemClone = _.cloneDeep(latestItemRef.current);
    let datasourceList = item.definition
      ? _.filter(groupedDatasourceList[item.definition] as any, (item) => {
          return item.identifier;
        })
      : [];
    const regex = stringToRegex(formatedRegex);
    if (regex) {
      datasourceList = _.filter(datasourceList, (option) => {
        return regex.test(option.identifier);
      });
    }
    const itemOptions = _.map(datasourceList, (ds) => {
      return { label: ds.name, value: ds.identifier };
    });

    onChange({
      options: itemOptions,
      value: getValueByOptions({
        variableValueFixed,
        variable: itemClone,
        itemOptions,
      }),
    });
  }, [JSON.stringify(item.definition), formatedRegex]);

  return (
    <div>
      <InputGroupWithFormItem label={label || name}>
        <Select
          style={{
            width: '180px',
          }}
          maxTagCount='responsive'
          defaultActiveFirstOption={false}
          showSearch
          dropdownMatchSelectWidth={false}
          value={value}
          onChange={(newValue) => {
            setValue(newValue as any);
            onChange({
              value: newValue,
            });
          }}
          optionFilterProp='children'
        >
          {_.map(options as any, (item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </InputGroupWithFormItem>
    </div>
  );
}
