import React, { useState, useEffect, useMemo } from 'react';
import _ from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import { Form, Checkbox, Switch, Space, Select, Tooltip, Row, Col, InputNumber, AutoComplete } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, QuestionCircleOutlined, RightOutlined, DownOutlined, InfoCircleOutlined } from '@ant-design/icons';

import AuthorizationWrapper from '@/components/AuthorizationWrapper';

import SectionCard, { SectionItem } from '../components/SectionCard';
import shouldShowAdvancedSettings from '../utils/shouldShowAdvancedSettings';
import { useFormNGData } from '../context';
import TaskTpls from './TaskTpls';
import NotificationRuleDropdownSelect from './NotificationRuleDropdownSelect';
import VersionSwitch from './VersionSwitch';

// @ts-ignore
import NotifyExtraNG from 'plus:/parcels/AlertRule/NotifyExtraNG';
// @ts-ignore
import NotifyChannelsTpl from 'plus:/parcels/AlertRule/NotifyChannelsTpl';

interface Props {
  item: SectionItem;
  advancedItem?: SectionItem;
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  disabled?: boolean;
  expandSignal?: { key: string; ts: number } | null;
  toggleAllSignal?: { action: 'expand' | 'collapse'; ts: number } | null;
}

export default function index({ item, advancedItem, sectionRefs, disabled, expandSignal, toggleAllSignal }: Props) {
  const { t } = useTranslation('alertRules');
  const { notifyChannels: contactList, teams: notifyGroups, webhooks, callbacks } = useFormNGData();

  const [notifyTargetCollapsed, setNotifyTargetCollapsed] = useState<boolean>(false);
  const [effectiveCollapsed, setEffectiveCollapsed] = useState(true);

  const datasourceCate = Form.useWatch('cate');
  const notify_version = Form.useWatch('notify_version');
  const notify_channels = Form.useWatch('notify_channels');
  const callbacksValue = Form.useWatch('callbacks');

  const showadvancedSettings = shouldShowAdvancedSettings(notify_version, datasourceCate);

  const globalFlashdutyPushConfigured = useMemo(() => {
    return _.some(webhooks, (item) => {
      // TODO 糟糕的设计，需要根据 url pathname 这种匹配来判断是否配置了 flashduty
      // 2024-03-05 排除掉事件墙的推送
      return _.includes(item.url, '/event/push/alert/n9e') && !_.includes(item.url, '/api/v1/event/push/alert/n9e') && item.enable;
    });
  }, [webhooks]);

  useEffect(() => {
    if (globalFlashdutyPushConfigured) {
      setNotifyTargetCollapsed(true);
    }
  }, [globalFlashdutyPushConfigured]);

  // Expand this section when sidebar triggers expansion
  useEffect(() => {
    if (expandSignal?.key === 'notify') {
      setEffectiveCollapsed(false);
    }
  }, [expandSignal]);

  // Respond to global collapse/expand all
  useEffect(() => {
    if (toggleAllSignal) {
      setEffectiveCollapsed(toggleAllSignal.action === 'collapse');
    }
  }, [toggleAllSignal]);

  return (
    <>
      <SectionCard
        className={!showadvancedSettings ? 'mb-8' : ''}
        item={item}
        index={3}
        collapsed={effectiveCollapsed}
        setCollapsed={setEffectiveCollapsed}
        sectionRef={(node) => {
          sectionRefs.current['notify'] = node;
        }}
      >
        <div className='mb-4'>
          <VersionSwitch />
        </div>
        <div
          style={{
            display: notify_version === 0 ? 'block' : 'none',
          }}
        >
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
            <Form.Item label={<Space>{t('notify_channels')}</Space>} name='notify_channels'>
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
        </div>
        <div
          style={{
            display: notify_version === 1 ? 'block' : 'none',
          }}
        >
          <NotificationRuleDropdownSelect />
        </div>
        <div className='mb-4'>
          <Space>
            <span>{t('notify_recovered')}</span>
            <Tooltip title={t(`notify_recovered_tip`)}>
              <QuestionCircleOutlined />
            </Tooltip>
            <Form.Item name='notify_recovered' valuePropName='checked' style={{ marginBottom: 0 }}>
              <Switch size='small' />
            </Form.Item>
          </Space>
        </div>
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
                    <InputNumber min={1} style={{ width: '100%' }} />
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
        <AuthorizationWrapper allowedPerms={['/job-tpls']}>
          <TaskTpls />
        </AuthorizationWrapper>
        <div
          style={{
            display: notify_version === 0 ? 'block' : 'none',
          }}
        >
          <Form.List name='callbacks'>
            {(fields, { add, remove }) => (
              <div>
                <Space align='baseline'>
                  {t('callbacks')}
                  <Tooltip
                    title={
                      <Trans
                        ns='alertRules'
                        i18nKey='alertRules:callbacks_tip'
                        components={{
                          a: <a href='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/msg-template/tpl_func/' target='_blank' />,
                        }}
                      />
                    }
                    overlayClassName='ant-tooltip-max-width-600 ant-tooltip-with-link'
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
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
        </div>
        <div
          style={{
            display: callbacksValue && callbacksValue.length > 0 ? 'block' : 'none',
          }}
        >
          <Space>
            {t('override_global_webhook')}
            <Tooltip title={t('override_global_webhook_tip')}>
              <InfoCircleOutlined />
            </Tooltip>
            <Form.Item name={['rule_config', 'override_global_webhook']} valuePropName='checked' noStyle>
              <Switch size='small' />
            </Form.Item>
          </Space>
        </div>
      </SectionCard>
      {showadvancedSettings && advancedItem && (
        <NotifyExtraNG
          advancedItem={advancedItem}
          sectionRefs={sectionRefs}
          contactList={contactList}
          notifyGroups={notifyGroups}
          expandSignal={expandSignal}
          toggleAllSignal={toggleAllSignal}
        />
      )}
    </>
  );
}
