import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { getTeamInfoList, getNotifiesList } from '@/services/manage';
import { useTranslation } from 'react-i18next';
import { Form, Space, Select, TimePicker, Checkbox, Row, Col, InputNumber  } from 'antd';
import { daysOfWeek } from '../../constants';
interface IProps {
    index: string;
    disabled: boolean;
  }
export default function com(props: IProps) {
  const { index, disabled } = props
  const { t } = useTranslation('alertRules');
  const [contactList, setContactList] = useState<{ key: string; label: string }[]>([]);
  const [notifyGroups, setNotifyGroups] = useState<any[]>([]);
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
  }, []);

  return (
    <div>
      <Form.List name={['rule_config', 'alert_configs', index,'effective_time']}>
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
      <Form.Item label={t('notify_channels')} name={['rule_config', 'alert_configs', index,'notify_channels']}>
        <Checkbox.Group disabled={disabled}>
          {contactList.map((item) => {
            return (
              <Checkbox value={item.key} key={item.label}>
                {item.label}
              </Checkbox>
            );
          })}
        </Checkbox.Group>
      </Form.Item>
      <Form.Item label={t('notify_groups')} name={['rule_config', 'alert_configs', index,'notify_groups']}>
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
      
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          return (
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label={t('recover_duration')} name={['rule_config', 'alert_configs', index,'recover_duration']} tooltip={t('recover_duration_tip', { num: getFieldValue('recover_duration') })}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={t('notify_repeat_step')}
                  name={['rule_config', 'alert_configs', index,'notify_repeat_step']}
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
                  name={['rule_config', 'alert_configs', index,'notify_max_number']}
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
    </div>
  );
}
