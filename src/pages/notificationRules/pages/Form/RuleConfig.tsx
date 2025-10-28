import React, { useState } from 'react';
import { Space, Row, Col, Form, Checkbox, Tooltip, TimePicker, Select } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, QuestionCircleOutlined, CopyOutlined, UpCircleOutlined, DownCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { SIZE, daysOfWeek } from '@/utils/constant';
import { KVTags } from '@/components/KVTagSelect';
import { ChannelItem } from '@/pages/notificationChannels/services';

import { NS, DEFAULT_VALUES_TIME_RANGE } from '../../constants';
import getValuePropsWithTimeFormItem from '../../utils/getValuePropsWithTimeFormItem';
import ChannelSelect from './ChannelSelect';
import TemplateSelect from './TemplateSelect';
import ChannelParams from './ChannelParams';
import Attributes from './Attributes';
import TestButton from './TestButton';

interface Props {
  disabled?: boolean;
  fields: FormListFieldData[];
  field: FormListFieldData;
  activeIndex?: number;
  setActiveIndex: (index?: number) => void;
  add: (defaultValue?: any, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
  eventKeys: string[];
}

export default function NotifyConfig(props: Props) {
  const { t } = useTranslation(NS);
  const { disabled, fields, field, activeIndex, setActiveIndex, add, remove, move, eventKeys } = props;
  const [channelItem, setChannelItem] = useState<ChannelItem>();
  const ruleConfig = Form.useWatch(['notify_configs', field.name]);

  return (
    <div key={field.key} className='p-4 mb-2 rounded bg-fc-200 fc-border relative'>
      {!disabled && (
        <div className='absolute right-[0px] top-[0px] z-1'>
          <Space>
            <CopyOutlined
              onClick={() => {
                add(ruleConfig, field.name + 1);
              }}
            />
            {fields.length > 1 && (
              <>
                {field.name !== 0 && (
                  <UpCircleOutlined
                    onClick={() => {
                      move(field.name, field.name - 1);
                    }}
                  />
                )}
                {field.name !== fields.length - 1 && (
                  <DownCircleOutlined
                    onClick={() => {
                      move(field.name, field.name + 1);
                    }}
                  />
                )}
              </>
            )}
            <MinusCircleOutlined
              onClick={() => {
                remove(field.name);
              }}
            />
          </Space>
        </div>
      )}
      <div className='p-4 pb-0 mb-4 rounded bg-fc-100 fc-border'>
        <Row gutter={SIZE}>
          <Col span={channelItem?.request_type !== 'flashduty' ? 12 : 24}>
            <ChannelSelect
              prefixNamePath={['notify_configs']}
              field={field}
              onChange={(_val, item) => {
                setChannelItem(item);
              }}
            />
          </Col>
          {channelItem?.request_type !== 'flashduty' && (
            <Col span={12}>
              <TemplateSelect prefixNamePath={['notify_configs']} field={field} />
            </Col>
          )}
        </Row>
        <ChannelParams prefixNamePath={['notify_configs']} field={field} channelItem={channelItem} />
      </div>
      <div className='p-4 mb-4 rounded bg-fc-100 fc-border'>
        <div className='p-4 pb-0 mb-2 rounded bg-fc-150 flex'>
          <Form.Item {...field} label={t('notification_configuration.severities')} tooltip={t('notification_configuration.severities_tip')} name={[field.name, 'severities']}>
            <Checkbox.Group disabled={disabled}>
              <Checkbox value={1}>{t('common:severity.1')}</Checkbox>
              <Checkbox value={2}>{t('common:severity.2')}</Checkbox>
              <Checkbox value={3}>{t('common:severity.3')}</Checkbox>
            </Checkbox.Group>
          </Form.Item>
        </div>
        <div className='p-4 mb-2 rounded bg-fc-150'>
          <Form.List {..._.omit(field, 'key')} name={[field.name, 'time_ranges']}>
            {(fields, { add, remove }) => (
              <>
                <Space className={fields.length ? 'mb-2' : ''}>
                  <div style={{ width: 450 }}>
                    <Space align='baseline' size={4}>
                      {t('notification_configuration.time_ranges')}
                      <Tooltip className='n9e-ant-from-item-tooltip' title={t('notification_configuration.time_ranges_tip')}>
                        <QuestionCircleOutlined />
                      </Tooltip>
                      {!disabled && <PlusCircleOutlined onClick={() => add(DEFAULT_VALUES_TIME_RANGE)} />}
                    </Space>
                  </div>
                  {fields.length ? <div style={{ width: 110 }}>{t('notification_configuration.effective_time_start')}</div> : null}
                  {fields.length ? <div style={{ width: 110 }}>{t('notification_configuration.effective_time_end')}</div> : null}
                </Space>
                {fields.map(({ key, name, ...restField }) => {
                  return (
                    <div key={`time_ranges-${key}`}>
                      <Space align='baseline'>
                        <Form.Item
                          {...restField}
                          name={[name, 'week']}
                          style={{ width: 450 }}
                          rules={[
                            {
                              required: true,
                              message: t('notification_configuration.effective_time_week_msg'),
                            },
                          ]}
                        >
                          <Select
                            mode='multiple'
                            options={_.map(daysOfWeek, (item) => {
                              return {
                                label: t(`common:time.weekdays.${item}`),
                                value: item,
                              };
                            })}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'start']}
                          style={{ width: 110 }}
                          rules={[
                            {
                              required: true,
                              message: t('notification_configuration.effective_time_start_msg'),
                            },
                          ]}
                          getValueProps={getValuePropsWithTimeFormItem}
                        >
                          <TimePicker format='HH:mm' />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'end']}
                          style={{ width: 110 }}
                          rules={[
                            {
                              required: true,
                              message: t('notification_configuration.effective_time_end_msg'),
                            },
                          ]}
                          getValueProps={getValuePropsWithTimeFormItem}
                        >
                          <TimePicker format='HH:mm' />
                        </Form.Item>
                        {!disabled && <MinusCircleOutlined onClick={() => remove(name)} />}
                      </Space>
                    </div>
                  );
                })}
              </>
            )}
          </Form.List>
        </div>
        <div className='p-4 mb-2 rounded bg-fc-150'>
          <KVTags
            disabled={disabled}
            field={field}
            fullName={['notify_configs']}
            name={[field.name, 'label_keys']}
            keyLabel={t('notification_configuration.label_keys')}
            keyLabelTootip={t('notification_configuration.label_keys_tip')}
            funcName='op'
          />
        </div>
        <div className='p-4 rounded bg-fc-150'>
          <Attributes disabled={disabled} field={field} fullName={['notify_configs']} keyOptions={['group_name', 'cluster', 'is_recovered', 'rule_id']} />
        </div>
      </div>
      {!disabled && <TestButton field={field} />}
    </div>
  );
}
