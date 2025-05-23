import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Form, Card, Space, Input, Select, Switch, Button, Row, Col, Affix } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getTeamInfoList } from '@/services/manage';
import { SIZE } from '@/utils/constant';
import { scrollToFirstError } from '@/utils';

import { NS, DEFAULT_VALUES } from '../../constants';
import { RuleItem } from '../../types';
import { normalizeFormValues } from '../../utils/normalizeValues';
import RuleConfig from './RuleConfig';
import EventPipelineConfigs from './EventPipelineConfigs';

interface Props {
  disabled?: boolean;
  initialValues?: RuleItem;
  onOk?: (values: RuleItem) => void;
  onCancel?: () => void;
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const { disabled, initialValues, onOk, onCancel } = props;
  const [form] = Form.useForm();
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>();

  useEffect(() => {
    getTeamInfoList().then((res) => {
      setUserGroups(res.dat ?? []);
    });
  }, []);

  return (
    <Form form={form} layout='vertical' initialValues={initialValues ?? DEFAULT_VALUES} disabled={disabled}>
      <Form.Item name='id' hidden>
        <Input />
      </Form.Item>
      <Card className='mb2' title={<Space>{t('basic_configuration')}</Space>}>
        <Row gutter={SIZE}>
          <Col flex='auto'>
            <Row gutter={SIZE}>
              <Col span={12}>
                <Form.Item label={t('common:table.name')} name='name' rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={t('user_group_ids')} tooltip={t('user_group_ids_tip')} name='user_group_ids' rules={[{ required: true }]}>
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
              </Col>
            </Row>
          </Col>
          <Col flex='none'>
            <Form.Item label={t('common:table.enabled')} tooltip={t('enabled_tip')} name='enable' valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('common:table.note')} tooltip={t('note_tip')} name='description' className='mb0'>
          <Input.TextArea />
        </Form.Item>
      </Card>
      <EventPipelineConfigs />
      <Form.List name='notify_configs'>
        {(fields, { add, remove, move }) => (
          <>
            {fields.map((field) => (
              <RuleConfig disabled={disabled} fields={fields} field={field} activeIndex={activeIndex} setActiveIndex={setActiveIndex} add={add} remove={remove} move={move} />
            ))}
            {!disabled && (
              <Button className='n9e-w-full mb2' type='dashed' onClick={() => add(DEFAULT_VALUES.notify_configs[0])} icon={<PlusOutlined />}>
                {t('notification_configuration.add_btn')}
              </Button>
            )}
          </>
        )}
      </Form.List>
      {!disabled && (
        <Affix offsetBottom={0}>
          <Card size='small' className='affix-bottom-shadow'>
            <Space>
              <Button
                type='primary'
                onClick={() => {
                  form
                    .validateFields()
                    .then(async (values) => {
                      onOk && onOk(normalizeFormValues(values));
                    })
                    .catch((err) => {
                      console.error(err);
                      scrollToFirstError();
                    });
                }}
              >
                {t('common:btn.save')}
              </Button>
              {onCancel ? (
                <Button onClick={onCancel}>{t('common:btn.cancel')}</Button>
              ) : (
                <Link to={`/${NS}`}>
                  <Button>{t('common:btn.cancel')}</Button>
                </Link>
              )}
            </Space>
          </Card>
        </Affix>
      )}
    </Form>
  );
}
