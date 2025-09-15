import React, { useState, useEffect } from 'react';
import { Form, Input, Card, Space, Row, Col, Select, Switch, Button, Affix } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import { getTeamInfoList } from '@/services/manage';
import { SIZE } from '@/utils/constant';
import { scrollToFirstError } from '@/utils';
import { KVTags } from '@/components/KVTagSelect';

import { Item } from '../../types';
import { NS, DEFAULT_VALUES } from '../../constants';
import Attributes from './Attributes';
import Processor from './Processor';
import TestModal from './TestModal';

interface Props {
  disabled?: boolean;
  initialValues?: Item;
  onOk?: (values: Item) => void;
  onCancel?: () => void;
}

export default function index(props: Props) {
  const { t } = useTranslation(NS);
  const { disabled, initialValues, onOk, onCancel } = props;
  const [form] = Form.useForm();
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);
  const formValues = Form.useWatch([], form);
  const filter_enable = Form.useWatch(['filter_enable'], form);

  useEffect(() => {
    form.setFieldsValue(initialValues ?? DEFAULT_VALUES);
  }, []);

  useEffect(() => {
    getTeamInfoList().then((res) => {
      setUserGroups(res.dat ?? []);
    });
  }, []);

  return (
    <Form form={form} layout='vertical' disabled={disabled}>
      <Form.Item name='id' hidden>
        <Input />
      </Form.Item>
      <Card
        className='mb-2'
        title={<Space>{t('basic_configuration')}</Space>}
        bodyStyle={{
          padding: '16px 16px 8px 16px',
        }}
      >
        <Row gutter={SIZE}>
          <Col span={12}>
            <Form.Item label={t('common:table.name')} name='name' rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('teams')}
              tooltip={{
                title: <Trans ns={NS} i18nKey={`${NS}:teams_tip`} components={{ br: <br /> }} />,
                overlayClassName: 'ant-tooltip-auto-width',
              }}
              name='team_ids'
              rules={[{ required: true }]}
            >
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
        <Form.Item label={t('common:table.note')} name='description'>
          <Input.TextArea />
        </Form.Item>
        <div className='mb-2'>
          <Space>
            <span>{t('filter_enable')}</span>
            <Form.Item name='filter_enable' valuePropName='checked' noStyle>
              <Switch size='small' />
            </Form.Item>
          </Space>
        </div>
        <div
          style={{
            display: filter_enable ? 'block' : 'none',
          }}
        >
          <div className='mb-2'>
            <KVTags
              disabled={disabled}
              name={['label_filters']}
              keyLabel={t('label_filters')}
              keyLabelTootip={<Trans ns={NS} i18nKey={`${NS}:label_filters_tip`} components={{ br: <br /> }} />}
              funcName='op'
            />
          </div>
          <Attributes disabled={disabled} name={['attribute_filters']} />
        </div>
      </Card>
      <Form.List name='processors'>
        {(fields, { add, remove, move }) => (
          <Space direction='vertical' size={SIZE * 2} className='w-full'>
            {fields.map((field) => (
              <Processor disabled={disabled} fields={fields} field={field} add={add} remove={remove} move={move} />
            ))}
            {!disabled && (
              <Button className='w-full mb-2' type='dashed' onClick={() => add(DEFAULT_VALUES.processors[0])} icon={<PlusOutlined />}>
                {t('processor.add_btn')}
              </Button>
            )}
          </Space>
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
                      onOk && onOk(values);
                    })
                    .catch((err) => {
                      console.error(err);
                      scrollToFirstError();
                    });
                }}
              >
                {t('common:btn.save')}
              </Button>
              <TestModal type='pipeline' config={formValues} />
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
