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

import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Card, Form, Checkbox, Switch, Space, Select, Tooltip, Row, Col, InputNumber, Input, AutoComplete } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, QuestionCircleFilled, RightOutlined, DownOutlined } from '@ant-design/icons';
import { getTeamInfoList, getNotifiesList } from '@/services/manage';
import { getAlertRulesCallbacks } from '@/services/warning';
import { getWebhooks } from '@/pages/help/NotificationSettings/services';
import { panelBaseProps } from '../../constants';
// @ts-ignore
import NotifyExtra from 'plus:/parcels/AlertRule/NotifyExtra';
// @ts-ignore
import NotifyChannelsTpl from 'plus:/parcels/AlertRule/NotifyChannelsTpl';

export default function index({ disabled }) {
  const { t } = useTranslation('alertRules');
  const [contactList, setContactList] = useState<{ key: string; label: string }[]>([]);
  const [notifyGroups, setNotifyGroups] = useState<any[]>([]);
  const [globalFlashdutyPushConfigured, setGlobalFlashdutyPushConfigured] = useState(false);
  const [notifyTargetCollapsed, setNotifyTargetCollapsed] = useState<boolean>(false);
  const [callbacks, setCallbacks] = useState<string[]>([]);
  const notify_channels = Form.useWatch('notify_channels');
  const getNotifyChannel = () => {
    getNotifiesList().then((res) => {
      setContactList(res || []);
    });
  };
  const getGroups = async (str) => {
    const res = await getTeamInfoList({ query: str });
    const data = res.dat || res;
    setNotifyGroups(data || []);
  };

  useEffect(() => {
    getGroups('');
    getNotifyChannel();
    getWebhooks().then((res) => {
      const globalFlashdutyPushConfigured = _.some(res, (item) => {
        // TODO 糟糕的设计，需要根据 url pathnam 这种匹配来判断是否配置了 flashduty
        // 2024-03-05 排除掉事件墙的推送
        return _.includes(item.url, '/event/push/alert/n9e') && !_.includes(item.url, '/api/v1/event/push/alert/n9e') && item.enable;
      });
      setGlobalFlashdutyPushConfigured(globalFlashdutyPushConfigured);
      if (globalFlashdutyPushConfigured) {
        setNotifyTargetCollapsed(true);
      }
    });
    getAlertRulesCallbacks().then((res) => {
      setCallbacks(res);
    });
  }, []);

  return (
    <>
      <Card {...panelBaseProps} title={t('notify_configs')}>
        <div
          style={{
            display: globalFlashdutyPushConfigured ? 'block' : 'none',
            marginBottom: 8,
            cursor: 'pointer',
          }}
          onClick={() => {
            setNotifyTargetCollapsed(!notifyTargetCollapsed);
          }}
        >
          <Space>
            <span>{t('notify_flashduty_configured')}</span>
            {notifyTargetCollapsed ? <RightOutlined /> : <DownOutlined />}
          </Space>
        </div>
        <div
          style={{
            display: notifyTargetCollapsed ? 'none' : 'block',
          }}
        >
          <Form.Item
            label={
              <Space>
                {t('notify_channels')}
                <a target='_blank' href='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v6/usage/alert/alert-notify/'>
                  {t('notify_channels_doc')}
                </a>
              </Space>
            }
            name='notify_channels'
          >
            <Checkbox.Group disabled={disabled}>
              {contactList.map((item) => {
                return (
                  <Checkbox key={item.label} value={item.key}>
                    {item.label}
                  </Checkbox>
                );
              })}
            </Checkbox.Group>
          </Form.Item>
          <NotifyChannelsTpl contactList={contactList} notify_channels={notify_channels} name={['extra_config', 'custom_notify_tpl']} />
          <Form.Item label={t('notify_groups')} name='notify_groups'>
            <Select mode='multiple' showSearch optionFilterProp='children'>
              {_.map(notifyGroups, (item) => {
                // id to string 兼容 v5
                return (
                  <Select.Option value={_.toString(item.id)} key={item.id}>
                    {item.name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </div>
        <Form.Item label={t('notify_recovered')}>
          <Space>
            <Form.Item name='notify_recovered' valuePropName='checked' style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
            <Tooltip title={t(`notify_recovered_tip`)}>
              <QuestionCircleFilled />
            </Tooltip>
          </Space>
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            return (
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label={t('recover_duration')} name='recover_duration' tooltip={t('recover_duration_tip', { num: getFieldValue('recover_duration') })}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={t('notify_repeat_step')}
                    name='notify_repeat_step'
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    tooltip={t('notify_repeat_step_tip', { num: getFieldValue('notify_repeat_step') })}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={t('notify_max_number')}
                    name='notify_max_number'
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    tooltip={t('notify_max_number_tip')}
                  >
                    <InputNumber min={0} precision={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            );
          }}
        </Form.Item>
        <Form.List name='callbacks'>
          {(fields, { add, remove }) => (
            <div>
              <Space align='baseline'>
                {t('callbacks')}
                <PlusCircleOutlined className='control-icon-normal' onClick={() => add()} />
              </Space>
              {fields.map((field) => (
                <Row gutter={16} key={field.key}>
                  <Col flex='auto'>
                    <Form.Item {...field} name={[field.name, 'url']}>
                      <AutoComplete
                        options={_.map(callbacks, (item) => {
                          return {
                            value: item,
                          };
                        })}
                        filterOption={(inputValue, option) => {
                          if (option && option.value && typeof option.value === 'string') {
                            return option.value.indexOf(inputValue) !== -1;
                          }
                          return true;
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col flex='40px'>
                    <MinusCircleOutlined className='control-icon-normal' onClick={() => remove(field.name)} />
                  </Col>
                </Row>
              ))}
            </div>
          )}
        </Form.List>
        <Form.List name='annotations'>
          {(fields, { add, remove }) => (
            <div>
              <Space align='baseline'>
                {t('annotations')}
                <PlusCircleOutlined className='control-icon-normal' onClick={() => add()} />
              </Space>
              {fields.map((field) => (
                <Row gutter={16} key={field.key}>
                  <Col flex='120px'>
                    <Form.Item {...field} name={[field.name, 'key']}>
                      <AutoComplete
                        options={[
                          {
                            value: 'runbook_url',
                          },
                          {
                            value: 'dashboard_url',
                          },
                          {
                            value: 'summary',
                          },
                        ]}
                        style={{ width: 200 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col flex='auto'>
                    <Form.Item {...field} name={[field.name, 'value']}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col flex='40px'>
                    <MinusCircleOutlined className='control-icon-normal' onClick={() => remove(field.name)} />
                  </Col>
                </Row>
              ))}
            </div>
          )}
        </Form.List>
      </Card>
      <NotifyExtra contactList={contactList} notifyGroups={notifyGroups} />
    </>
  );
}
