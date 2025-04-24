import React, { useState } from 'react';
import _ from 'lodash';
import { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import Links from '@/pages/explorer/components/Links';
import moment from 'moment';

interface IProps {
  fieldKey: string;
  fieldValue: string;
  fieldConfig?: FieldConfigVersion2;
  rawValue: object; // 待提取的日志原文数据
  range: IRawTimeRange;
  adjustFieldValue?: (formatedValue: string) => React.ReactNode;
}

export default function RenderValue(props: IProps) {
  const { fieldKey, fieldValue, fieldConfig, rawValue, range, adjustFieldValue } = props;
  const fieldAttr = fieldConfig?.arr.find((i) => i.field === fieldKey);
  const fieldLinks = fieldConfig?.linkArr.filter((i) => i.field === fieldKey);
  let displayValue = fieldValue;
  if (fieldAttr?.formatMap?.type === 'date' && fieldAttr?.formatMap?.params?.pattern) {
    displayValue = moment(fieldValue).format(fieldAttr?.formatMap?.params?.pattern);
  }
  if (fieldAttr?.formatMap?.type === 'url' && fieldAttr?.formatMap?.params?.urlTemplate) {
    displayValue = fieldAttr?.formatMap?.params?.labelTemplate.replace('{{value}}', fieldValue);
  }

  const value = adjustFieldValue ? adjustFieldValue(displayValue) : displayValue;

  if (rawValue && fieldLinks && fieldLinks.length > 0) {
    return <Links rawValue={rawValue} range={range} text={value} paramsArr={fieldLinks} regExtractArr={fieldConfig?.regExtractArr} />;
  }
  return <span>{value}</span>;
}
