import React from 'react';
import _ from 'lodash';
import { Form, Card, Space, Input, Select, Switch, Button, Row, Col, Affix, Segmented } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { SIZE } from '@/utils/constant';
import { scrollToFirstError } from '@/utils';

import { NS, DEFAULT_VALUES } from '../../constants';
import { ChannelItem } from '../../types';
import ContactKeysSelect from './components/ContactKeysSelect';
import HTTP from './HTTP';
import SMTP from './SMTP';
import Script from './Script';

interface Props {
  initialValues?: ChannelItem;
  onOk: (values: ChannelItem) => void;
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const [form] = Form.useForm();
  const paramConfigType = Form.useWatch(['param_config', 'param_type'], form);

  return (
    <Form form={form} layout='vertical' initialValues={props.initialValues ?? DEFAULT_VALUES}>
      <Card className='mb2' title={<Space>{t('basic_configuration')}</Space>}>
        <Form.Item name='id' hidden>
          <Input />
        </Form.Item>
        <Form.Item label={t('common:table.name')} name='name' rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t('common:table.ident')} name='ident' rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t('common:table.note')} name='note'>
          <Input.TextArea />
        </Form.Item>
        <Form.Item label={t('common:table.enabled')} name='enable' valuePropName='checked'>
          <Switch />
        </Form.Item>
      </Card>
      <Card className='mb2' title={<Space>{t('variable_configuration.title')}</Space>}>
        <Form.Item label={t('variable_configuration.param_type')} name={['param_config', 'param_type']} rules={[{ required: true }]}>
          <Select
            options={[
              {
                label: t('variable_configuration.user_info'),
                value: 'user_info',
              },
              {
                label: t('variable_configuration.flashduty'),
                value: 'flashduty',
              },
              {
                label: t('variable_configuration.custom'),
                value: 'custom',
              },
            ]}
          />
        </Form.Item>
        <div
          style={{
            display: paramConfigType === 'user_info' ? 'block' : 'none',
          }}
        >
          <Form.Item label={t('variable_configuration.contact_key')} name={['param_config', 'user_info', 'contact_key']} rules={[{ required: paramConfigType === 'user_info' }]}>
            <ContactKeysSelect showSearch optionFilterProp='label' />
          </Form.Item>
          <Form.Item label={t('variable_configuration.batch')} name={['param_config', 'user_info', 'batch']} valuePropName='checked'>
            <Switch />
          </Form.Item>
        </div>
        <div
          style={{
            display: paramConfigType === 'flashduty' ? 'block' : 'none',
          }}
        >
          <Form.Item
            label={t('variable_configuration.integration_url')}
            name={['param_config', 'flashduty', 'integration_url']}
            rules={[{ required: paramConfigType === 'flashduty' }]}
          >
            <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} />
          </Form.Item>
        </div>
        <div
          style={{
            display: paramConfigType === 'custom' ? 'block' : 'none',
          }}
        >
          <Form.List name={['param_config', 'custom', 'params']}>
            {(fields, { add, remove }) => (
              <>
                <div className='mb1'>
                  <Space>
                    {t('variable_configuration.params.title')}
                    <PlusCircleOutlined
                      onClick={() =>
                        add({
                          type: 'string',
                        })
                      }
                    />
                  </Space>
                </div>
                <Row gutter={SIZE} className='mb1'>
                  <Col flex='auto'>
                    <Row gutter={SIZE}>
                      <Col span={12}>{t('variable_configuration.params.key')}</Col>
                      <Col span={12}>{t('variable_configuration.params.cname')}</Col>
                    </Row>
                  </Col>
                  <Col flex='none'>
                    <div style={{ width: 12 }} />
                  </Col>
                </Row>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={SIZE} key={key}>
                    <Col flex='auto'>
                      <Row gutter={SIZE}>
                        <Form.Item {...restField} name={[name, 'type']} hidden>
                          <Input />
                        </Form.Item>
                        <Col span={12}>
                          <Form.Item {...restField} name={[name, 'key']} rules={[{ required: paramConfigType === 'custom' }]}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item {...restField} name={[name, 'cname']} rules={[{ required: paramConfigType === 'custom' }]}>
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col flex='none'>{fields.length > 1 ? <MinusCircleOutlined className='mt1' onClick={() => remove(name)} /> : <div style={{ width: 12 }} />}</Col>
                  </Row>
                ))}
              </>
            )}
          </Form.List>
        </div>
      </Card>
      <Card
        className='mb2'
        title={<Space>{t('request_configuration')}</Space>}
        style={{
          display: paramConfigType !== 'flashduty' ? 'block' : 'none',
        }}
      >
        <Form.Item name='request_type'>
          <Segmented
            options={[
              {
                label: t('http_request_config.title'),
                value: 'http',
              },
              {
                label: t('smtp_request_config.title'),
                value: 'smtp',
              },
              {
                label: t('script_request_config.title'),
                value: 'script',
              },
            ]}
          />
        </Form.Item>
        <HTTP />
        <SMTP />
        <Script />
      </Card>
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
