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
import { Form, Radio, Space } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import Severity from '@/pages/alertRules/Form/components/Severity';
import Builder from './Builder';
import Code from './Code';
import RecoverConfig from './RecoverConfig';
import Joins from './Joins';

interface IProps {
  prefixField?: any;
  fullPrefixName?: (string | number)[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: (string | number)[]; // 列表字段名
  queries: any[];
  disabled?: boolean;
}

export default function Trigger(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { prefixField = {}, fullPrefixName = [], prefixName = [], queries, disabled } = props;
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className='n9e-fill-color-3 p2'>
      <Form.Item {...prefixField} name={[...prefixName, 'mode']}>
        <Radio.Group buttonStyle='solid' size='small' disabled={disabled}>
          <Radio.Button value={0}>{t('datasource:es.alert.trigger.builder')}</Radio.Button>
          <Radio.Button value={1}>{t('datasource:es.alert.trigger.code')}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const mode = getFieldValue([...fullPrefixName, 'mode']);
          if (mode == 0) {
            return <Builder prefixField={prefixField} prefixName={prefixName} queries={queries} disabled={disabled} />;
          }
          if (mode === 1) {
            return <Code prefixField={prefixField} prefixName={prefixName} disabled={disabled} />;
          }
        }}
      </Form.Item>
      <div className='mb-4'>
        <Severity field={prefixField} disabled={disabled} />
      </div>
      <RecoverConfig {...props} />
      <div>
        <div className='mb-2'>
          <Space
            className='cursor-pointer'
            onClick={() => {
              setExpanded(!expanded);
            }}
          >
            {t('trigger.advanced_settings.label')}
            {expanded ? <DownOutlined /> : <RightOutlined />}
          </Space>
        </div>
        <div
          style={{
            display: expanded ? 'block' : 'none',
          }}
        >
          <Joins {...props} />
        </div>
      </div>
    </div>
  );
}
