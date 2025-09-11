import React, { useEffect, useContext, useState } from 'react';
import { Select } from 'antd';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import { IVariable } from '../types';
import getValueByOptions from '../utils/getValueByOptions';
import { Props } from './types';

export default function Datasource(props: Props) {
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { item, formatedReg, variableValueFixed, onChange, value, setValue } = props;
  const { name, label } = item;
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const latestItemRef = React.useRef<IVariable>(item);

  useEffect(() => {
    latestItemRef.current = item;
  });

  useEffect(() => {
    const itemClone = _.cloneDeep(latestItemRef.current);
    let datasourceList = item.definition ? (groupedDatasourceList[item.definition] as any) : [];
    if (formatedReg) {
      datasourceList = _.filter(datasourceList, (option) => {
        return formatedReg.test(option.name);
      });
    }
    const itemOptions = _.map(datasourceList, (ds) => {
      return { label: ds.name, value: ds.id }; // TODO value 实际是 number 类型
    });

    onChange({
      value: getValueByOptions({
        variableValueFixed,
        variable: itemClone,
        itemOptions,
      }),
    });
    setOptions(itemOptions);
  }, [JSON.stringify(item.definition), formatedReg]);

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
