import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Form, Card, Space, Input, Select, Switch, Button, Row, Col, Checkbox, TimePicker, Affix } from 'antd';
import { PlusOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getTeamInfoList } from '@/services/manage';
import { SIZE, daysOfWeek } from '@/utils/constant';
import { scrollToFirstError } from '@/utils';
import KVTagSelect, { validatorOfKVTagSelect } from '@/components/KVTagSelect';

import { NS, DEFAULT_VALUES } from '../../constants';
import { RuleItem } from '../../types';
import getValuePropsWithTimeFormItem from '../../utils/getValuePropsWithTimeFormItem';
import ChannelSelect from './ChannelSelect';
import TemplateSelect from './TemplateSelect';
import ChannelParams from './ChannelParams';

interface Props {
  initialValues?: RuleItem;
  onOk: (values: RuleItem) => void;
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const [form] = Form.useForm();
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    getTeamInfoList().then((res) => {
      setUserGroups(res.dat ?? []);
    });
  }, []);

  return (
    <Form form={form} layout='vertical' initialValues={props.initialValues ?? DEFAULT_VALUES}>
      <Form.Item name='id' hidden>
        <Input />
      </Form.Item>
      <Card className='mb2' title={<Space>{t('basic_configuration')}</Space>}>
        <Form.Item label={t('common:table.name')} name='name' rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t('user_group_ids')} name='user_group_ids' rules={[{ required: true }]}>
          <Select
            showSearch
            optionFilterProp='label'
            mode='multiple'
            options={_.map(userGroups, (item) => {
              return {
                label: item.name,
                value: item.id,
              };
            })}
          />
        </Form.Item>
        <Form.Item label={t('common:table.note')} name='note'>
          <Input.TextArea />
        </Form.Item>
        <Form.Item label={t('common:table.enabled')} name='enable' valuePropName='checked'>
          <Switch />
        </Form.Item>
      </Card>
      <Form.List name='notify_configs'>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Card
                className='mb2'
                key={field.key}
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
                  <Col span={12}>
                    <ChannelSelect field={field} />
                  </Col>
                  <Col span={12}>
                    <TemplateSelect field={field} />
                  </Col>
                </Row>
                <ChannelParams field={field} />
                <Form.Item {...field} label={t('notification_configuration.severities')} name={[field.name, 'severities']}>
                  <Checkbox.Group>
                    <Checkbox value={1}>{t('common:severity.1')}</Checkbox>
                    <Checkbox value={2}>{t('common:severity.2')}</Checkbox>
                    <Checkbox value={3}>{t('common:severity.3')}</Checkbox>
                  </Checkbox.Group>
                </Form.Item>
                <Form.List {...field} name={[field.name, 'time_ranges']}>
                  {(fields, { add, remove }) => (
                    <>
                      <Space>
                        <div style={{ width: 450 }}>
                          <Space align='baseline'>
                            {t('notification_configuration.time_ranges')}
                            <PlusCircleOutlined className='control-icon-normal' onClick={() => add(DEFAULT_VALUES.notify_configs[0].time_ranges[0])} />
                          </Space>
                        </div>
                        <div style={{ width: 110 }}>{t('notification_configuration.effective_time_start')}</div>
                        <div style={{ width: 110 }}>{t('notification_configuration.effective_time_end')}</div>
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
                            name={[name, 'week']}
                            style={{ width: 450 }}
                            rules={[
                              {
                                required: true,
                                message: t('notification_configuration.effective_time_week_msg'),
                              },
                            ]}
                          >
                            <Select mode='tags'>
                              {daysOfWeek.map((item) => {
                                return (
                                  <Select.Option key={item} value={item}>
                                    {t(`common:time.weekdays.${item}`)}
                                  </Select.Option>
                                );
                              })}
                            </Select>
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
                      ))}
                    </>
                  )}
                </Form.List>
                <Form.Item
                  {...field}
                  label={t('notification_configuration.label_keys')}
                  name={[field.name, 'label_keys']}
                  rules={[validatorOfKVTagSelect]}
                  getValueProps={(value) => {
                    return value ?? undefined;
                  }}
                >
                  <KVTagSelect />
                </Form.Item>
                <Button ghost type='primary' onClick={() => {}}>
                  {t('notification_configuration.run_test_btn')}
                </Button>
              </Card>
            ))}
            <Button type='dashed' onClick={() => add()} style={{ width: '100%' }} icon={<PlusOutlined />}>
              {t('notification_configuration.add_btn')}
            </Button>
          </>
        )}
      </Form.List>
      <Affix offsetBottom={0}>
        <Card size='small' className='affix-bottom-shadow'>
          <Space>
            <Button
              type='primary'
              onClick={() => {
                form
                  .validateFields()
                  .then(async (values) => {
                    props.onOk(values);
                  })
                  .catch((err) => {
                    console.error(err);
                    scrollToFirstError();
                  });
              }}
            >
              {t('common:btn.save')}
            </Button>
            <Link to={`/${NS}`}>
              <Button>{t('common:btn.cancel')}</Button>
            </Link>
          </Space>
        </Card>
      </Affix>
    </Form>
  );
}
