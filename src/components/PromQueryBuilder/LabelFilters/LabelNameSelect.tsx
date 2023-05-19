import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'antd';
import _ from 'lodash';
import { getLabelNames } from '@/services/dashboardV2';
import { getMatchByLabels } from './utils';

interface IProps {
  metric?: string;
  labels: {
    label: string;
    value: string;
    op: string;
  }[];
  datasourceValue: number;
  params: {
    start: number;
    end: number;
  };
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
  value?: string;
  onChange: (val: string) => void;
}

export default function LabelNameSelect(props: IProps) {
  const { metric, labels, datasourceValue, params, style, size, value, onChange } = props;
  const [labelNames, setLabelNames] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string | undefined>();

  useEffect(() => {
    if (metric) {
      getLabelNames(
        {
          ...params,
          'match[]': getMatchByLabels(metric, labels, value),
        },
        datasourceValue,
      ).then((res) => {
        setLabelNames(res.data);
      });
    }
  }, [metric, labels]);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  return (
    <AutoComplete
      size={size}
      style={{
        ...(style || {}),
      }}
      options={_.map(labelNames, (item) => {
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
