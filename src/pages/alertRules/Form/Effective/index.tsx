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
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Switch, Space, Select, TimePicker } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { CommonStateContext } from '@/App';
import { panelBaseProps, daysOfWeek } from '../../constants';

// @ts-ignore
import ServiceCalendarSelect from 'plus:/pages/ServiceCalendar/ServiceCalendarSelect';

export default function index() {
  const { t } = useTranslation('alertRules');
  const { isPlus } = useContext(CommonStateContext);

  return (
    <Card {...panelBaseProps} title={t('effective_configs')}>
      <div style={{ marginBottom: 10 }}>
        <Space>
          <span>{t('enable_status')}</span>
          <Form.Item name='enable_status' valuePropName='checked' noStyle>
            <Switch />
          </Form.Item>
        </Space>
      </div>
      <Form.List name='effective_time'>
        {(fields, { add, remove }) => (
          <>
            <Space>
              <div style={{ width: 450 }}>
                <Space align='baseline'>
                  {t('effective_time')}
                  <PlusCircleOutlined className='control-icon-normal' onClick={() => add()} />
                </Space>
              </div>
              <div style={{ width: 110 }}>{t('effective_time_start')}</div>
              <div style={{ width: 110 }}>{t('effective_time_end')}</div>
            </Space>
            {fields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                style={{
                  display: 'flex',
                  marginBottom: 8,
                }}
                align='baseline'
              >
                <Form.Item
                  {...restField}
                  name={[name, 'enable_days_of_week']}
                  style={{ width: 450 }}
                  rules={[
                    {
                      required: true,
                      message: t('effective_time_week_msg'),
                    },
                  ]}
                >
                  <Select mode='tags'>
                    {daysOfWeek.map((item) => {
                      return (
                        <Select.Option key={item} value={String(item)}>
                          {t(`common:time.weekdays.${item}`)}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'enable_stime']}
                  style={{ width: 110 }}
                  rules={[
                    {
                      required: true,
                      message: t('effective_time_start_msg'),
                    },
                  ]}
                >
                  <TimePicker format='HH:mm' />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'enable_etime']}
                  style={{ width: 110 }}
                  rules={[
                    {
                      required: true,
                      message: t('effective_time_end_msg'),
                    },
                  ]}
                >
                  <TimePicker format='HH:mm' />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
          </>
        )}
      </Form.List>
      {isPlus && <ServiceCalendarSelect name={['extra_config', 'service_cal_ids']} />}
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
        {({ getFieldValue }) => {
          if (getFieldValue('cate') === 'prometheus') {
            return (
              <Form.Item label={t('enable_in_bg')}>
                <Space align='baseline'>
                  <Form.Item name='enable_in_bg' valuePropName='checked'>
                    <Switch />
                  </Form.Item>
                  {t('enable_in_bg_tip')}
                </Space>
              </Form.Item>
            );
          }
        }}
      </Form.Item>
    </Card>
  );
}
