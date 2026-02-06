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
import { Card, Form, Switch, Space, Select, TimePicker, Tooltip } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useRequest } from 'ahooks';
import moment from 'moment-timezone';

import { CommonStateContext } from '@/App';
import { HelpLink } from '@/components/pageLayout';

import { panelBaseProps, daysOfWeek } from '../../constants';
import { getTimezones } from '../../services';

// @ts-ignore
import ServiceCalendarWithTimeSelect from 'plus:/pages/ServiceCalendar/ServiceCalendarWithTimeSelect';

export default function index() {
  const { t } = useTranslation('alertRules');
  const { isPlus } = useContext(CommonStateContext);
  const form = Form.useFormInstance();
  const time_zone = Form.useWatch('time_zone');

  const { data: timezones } = useRequest(() => getTimezones(), {
    refreshDeps: [],
  });

  return (
    <Card
      {...panelBaseProps}
      title={
        <Space>
          {t('effective_configs')}
          <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/alert/alert-rules/effective-configuration/' />
        </Space>
      }
    >
      <div className='mb-4'>
        <Space>
          <span>{t('enable_status')}</span>
          <Form.Item name='enable_status' valuePropName='checked' noStyle>
            <Switch />
          </Form.Item>
        </Space>
      </div>
      <Form.Item label={t('time_zone')} name='time_zone'>
        <Select
          options={_.map(timezones, (item) => {
            return { label: item, value: item };
          })}
          showSearch
          optionFilterProp='label'
          allowClear
        />
      </Form.Item>
      <Form.List name='effective_time'>
        {(fields, { add, remove }) => (
          <>
            <Space>
              <div style={{ width: 450 }}>
                <Space align='baseline'>
                  {t('effective_time')}
                  <PlusCircleOutlined
                    className='control-icon-normal'
                    onClick={() =>
                      add({
                        enable_stime: moment('00:00', 'HH:mm'),
                        enable_etime: moment('00:00', 'HH:mm'),
                      })
                    }
                  />
                </Space>
              </div>
              {!_.isEmpty(fields) && (
                <>
                  <div style={{ width: 110 }}>
                    <Space>
                      {t('effective_time_start')}
                      <Tooltip overlayClassName='ant-tooltip-max-width-600' title={t('effective_time_tip')}>
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  </div>
                  <div style={{ width: 110 }}>
                    <Space>
                      {t('effective_time_end')}
                      <Tooltip overlayClassName='ant-tooltip-max-width-600' title={t('effective_time_tip')}>
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  </div>
                </>
              )}
            </Space>
            {fields.map(({ key, name, ...restField }) => {
              const enable_stime = form.getFieldValue(['effective_time', name, 'enable_stime']);
              const enable_etime = form.getFieldValue(['effective_time', name, 'enable_etime']);
              let local_text = '';
              if (enable_stime && enable_etime && time_zone) {
                const local_stime = moment.tz(enable_stime.format('HH:mm'), 'HH:mm', time_zone).local().format('HH:mm');
                const local_etime = moment.tz(enable_etime.format('HH:mm'), 'HH:mm', time_zone).local().format('HH:mm');
                local_text = `${local_stime} ~ ${local_etime}`;
              }

              return (
                <Space key={key} className='flex' align='baseline' wrap>
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
                  {local_text && (
                    <div>
                      {t('local_time')}: {local_text}
                    </div>
                  )}
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              );
            })}
          </>
        )}
      </Form.List>
      {isPlus && (
        <div>
          <ServiceCalendarWithTimeSelect namePath={['extra_config', 'service_cal_configs']} time_zone={time_zone} />
        </div>
      )}
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
        {({ getFieldValue }) => {
          if (getFieldValue('cate') === 'prometheus') {
            return (
              <Form.Item label={t('enable_in_bg')}>
                <Space align='baseline'>
                  <Form.Item name='enable_in_bg' valuePropName='checked' noStyle>
                    <Switch />
                  </Form.Item>
                  {t('enable_in_bg_tip')}
                </Space>
              </Form.Item>
            );
          }
        }}
      </Form.Item>
      {/* <div className='mt-2'>
        <AlertEventRuleTesterWithButton
          onClick={() => {
            return form.validateFields();
          }}
          onTest={(eventID) => {
            return form.validateFields().then((values: any) => {
              return alertRulesEnableTryrun({
                event_id: eventID,
                config: processFormValues(values),
              });
            });
          }}
        />
      </div> */}
    </Card>
  );
}
