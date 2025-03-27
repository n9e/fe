/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
  const exp_trigger_disable = Form.useWatch(['rule_config', 'exp_trigger_disable']);
  const nodata_trigger_enable = Form.useWatch(['rule_config', 'nodata_trigger', 'enable']);
  const anomaly_trigger_enable = Form.useWatch(['rule_config', 'anomaly_trigger', 'enable']);
  let defaultActiveKey = 'triggers';
  if (nodata_trigger_enable === true) {
    defaultActiveKey = 'nodata_trigger';
  } else if (anomaly_trigger_enable === true) {
    defaultActiveKey = 'anomaly_trigger';
  }

  // if (exp_trigger_disable === undefined || nodata_trigger_enable === undefined) return null;
  return <Triggers {...props} defaultActiveKey={defaultActiveKey} />;
}
