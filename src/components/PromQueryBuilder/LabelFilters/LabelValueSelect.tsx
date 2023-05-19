import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'antd';
import _ from 'lodash';
import { getLabelValues } from '@/services/dashboardV2';

interface IProps {
  label: string;
  datasourceValue: number;
  params: {
    start: number;
    end: number;
  };
  style?: React.CSSProperties;
  value?: string;
  onChange: (val: string) => void;
}

export default function LabelValueSelect(props: IProps) {
  const { label, datasourceValue, params, style, value, onChange } = props;
  const [labelValues, setLabelValues] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string | undefined>();

  useEffect(() => {
    if (label) {
      getLabelValues(label, params, datasourceValue).then((res) => {
        setLabelValues(res.data);
      });
    }
  }, [label]);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  return (
    <AutoComplete
      style={{
        ...(style || {}),
      }}
      options={_.map(labelValues, (item) => {
        return {
          value: item,
        };
      })}
      value={searchValue}
      filterOption={(inputValue, option) => {
        if (option && option.value && typeof option.value === 'string') {
          return option.value.indexOf(inputValue) !== -1;
        }
        return true;
      }}
      onSearch={(val) => {
        setSearchValue(val);
      }}
      onBlur={(e: any) => {
        onChange(e.target.value);
      }}
      onSelect={(val) => {
        onChange(val);
      }}
    />
  );
}
