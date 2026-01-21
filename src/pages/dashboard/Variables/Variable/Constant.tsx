import React, { useEffect } from 'react';
import { Input } from 'antd';
import _ from 'lodash';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import { IVariable } from '../types';
import getValueByOptions from '../utils/getValueByOptions';
import { Props } from './types';

export default function Constant(props: Props) {
  const { item, variableValueFixed, onChange, value } = props;
  const { name, label, definition } = item;
  const latestItemRef = React.useRef<IVariable>(item);

  useEffect(() => {
    latestItemRef.current = item;
  });

  useEffect(() => {
    const itemClone = _.cloneDeep(latestItemRef.current);

    onChange({
      value: getValueByOptions({
        variableValueFixed,
        variable: {
          ...itemClone,
          value: itemClone.definition,
        },
      }),
    });
  }, [JSON.stringify(item.definition)]);

  return (
    <div>
      <InputGroupWithFormItem label={label || name}>
        <Input disabled value={definition} />
      </InputGroupWithFormItem>
    </div>
  );
}
