import React, { useEffect } from 'react';
import { Input } from 'antd';
import _ from 'lodash';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import { IVariable } from '../types';
import getValueByOptions from '../utils/getValueByOptions';
import { Props } from './types';

export default function Textbox(props: Props) {
  const { item, variableValueFixed, onChange, value, setValue } = props;
  const { name, label } = item;
  const latestItemRef = React.useRef<IVariable>(item);

  useEffect(() => {
    latestItemRef.current = item;
  });

  useEffect(() => {
    const itemClone = _.cloneDeep(latestItemRef.current);

    onChange({
      value: getValueByOptions({
        variableValueFixed,
        variable: itemClone,
      }),
    });
  }, [JSON.stringify(item.definition)]);

  return (
    <div>
      <InputGroupWithFormItem label={label || name}>
        <Input
          value={value}
          onBlur={(e) => {
            let val = e.target.value;
            onChange({
              value: val,
            });
          }}
          onKeyDown={(e: any) => {
            if (e.code === 'Enter') {
              let val = e.target.value;
              onChange({
                value: val,
              });
            }
          }}
          onChange={(e) => {
            let val = e.target.value;
            setValue(val as any);
          }}
        />
      </InputGroupWithFormItem>
    </div>
  );
}
