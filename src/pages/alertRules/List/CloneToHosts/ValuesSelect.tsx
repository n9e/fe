import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Select } from 'antd';
import { getBusiGroups } from '@/services/common';
import { getTargetTags } from '@/services/targets';

interface IProps {
  queryKey: string;
  value: any;
  onChange: (value: any) => void;
}

export default function ValuesSelect(props: IProps) {
  const { queryKey, value, onChange } = props;
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    if (queryKey === 'group_ids') {
      getBusiGroups().then((res) => {
        setOptions(
          _.map(res?.dat || [], (item) => {
            return {
              id: item.id,
              name: item.name,
            };
          }),
        );
      });
    } else if (queryKey === 'tags') {
      getTargetTags(undefined).then((res) => {
        setOptions(
          _.map(res?.dat || [], (item) => {
            return {
              id: item,
              name: item,
            };
          }),
        );
      });
    }
  }, [queryKey]);

  return (
    <Select
      mode='multiple'
      style={{ minWidth: 200, maxWidth: 600 }}
      optionFilterProp='label'
      options={_.map(options, (item) => {
        return {
          label: item.name,
          value: item.id,
        };
      })}
      value={value}
      onChange={onChange}
    />
  );
}
