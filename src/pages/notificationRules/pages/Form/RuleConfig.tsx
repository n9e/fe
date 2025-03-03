import React, { useState } from 'react';
import { Card, Space, Row, Col, Form, Checkbox, Tooltip, TimePicker, Select } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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
import TestButton from './TestButton';

interface Props {
  fields: FormListFieldData[];
  field: FormListFieldData;
  remove: (index: number | number[]) => void;
}

export default function NotifyConfig(props: Props) {
  const { t } = useTranslation(NS);
  const { fields, field, remove } = props;
  const [channelItem, setChannelItem] = useState<ChannelItem>();
  const form = Form.useFormInstance();

  return (
    <Card
      key={field.key}
      className='mb2'
      title={<Space>{t('notification_configuration.title')}</Space>}
      extra={
        fields.length > 1 && (
          <MinusCircleOutlined
            onClick={() => {
              remove(field.name);
            }}
          />
        )
      }
    >
      <Row gutter={SIZE}>
        <Col span={channelItem?.request_type !== 'flashduty' ? 12 : 24}>
          <ChannelSelect
            field={field}
            onChange={(_val, item) => {
              setChannelItem(item);
            }}
          />
        </Col>
        {channelItem?.request_type !== 'flashduty' && (
          <Col span={12}>
            <TemplateSelect field={field} />
          </Col>
        )}
      </Row>
      <ChannelParams field={field} channelItem={channelItem} />
      <Form.Item {...field} label={t('notification_configuration.severities')} tooltip={t('notification_configuration.severities_tip')} name={[field.name, 'severities']}>
        <Checkbox.Group>
          <Checkbox value={1}>{t('common:severity.1')}</Checkbox>
          <Checkbox value={2}>{t('common:severity.2')}</Checkbox>
          <Checkbox value={3}>{t('common:severity.3')}</Checkbox>
        </Checkbox.Group>
      </Form.Item>
      <Form.List {..._.omit(field, 'key')} name={[field.name, 'time_ranges']}>
        {(fields, { add, remove }) => (
          <>
            <Space className='mb1'>
              <div style={{ width: 450 }}>
                <Space align='baseline' size={4}>
                  {t('notification_configuration.time_ranges')}
                  <Tooltip className='n9e-ant-from-item-tooltip' title={t('notification_configuration.time_ranges_tip')}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                  <PlusCircleOutlined onClick={() => add(DEFAULT_VALUES_TIME_RANGE)} />
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
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                </div>
              );
            })}
          </>
        )}
      </Form.List>
      <KVTags
        field={field}
        fullName={['notify_configs']}
        name={[field.name, 'label_keys']}
        keyLabel={t('notification_configuration.label_keys')}
        keyLabelTootip={t('notification_configuration.label_keys_tip')}
        funcName='op'
      />
      <KVTags
        field={field}
        fullName={['notify_configs']}
        name={[field.name, 'attributes']}
        keyLabel={t('notification_configuration.attributes')}
        keyLabelTootip={t('notification_configuration.attributes_tip')}
        keyType='select'
        keyOptions={[
          {
            label: t('notification_configuration.attributes_options.group_name'),
            value: 'group_name',
          },
          {
            label: t('notification_configuration.attributes_options.cluster'),
            value: 'cluster',
          },
        ]}
        funcName='func'
        valueLabel={t('notification_configuration.attributes_value')}
        addWapper={(add) => {
          add({
            key: 'group_name',
            func: '==',
          });
        }}
      />
      <TestButton field={field} />
    </Card>
  );
}
