import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import Triggers from './Triggers';

interface IProps {
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: string[]; // 列表字段名
  queries: any[];
  disabled?: boolean;
  initialValue?: any;
}

export default function index(props: IProps) {
  const nodata_trigger_enable = Form.useWatch(['rule_config', 'nodata_trigger', 'enable']);
  const anomaly_trigger_enable = Form.useWatch(['rule_config', 'anomaly_trigger', 'enable']);
  let defaultActiveKey = 'triggers';
  if (nodata_trigger_enable === true) {
    defaultActiveKey = 'nodata_trigger';
  } else if (anomaly_trigger_enable === true) {
    defaultActiveKey = 'anomaly_trigger';
  }

  return <Triggers {...props} defaultActiveKey={defaultActiveKey} />;
}
