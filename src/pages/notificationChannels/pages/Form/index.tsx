import React from 'react';
import _ from 'lodash';
import { Form, Card, Space, Input, Switch, Button, Row, Col, Affix, Segmented, Tooltip } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSize } from 'ahooks';

import { SIZE } from '@/utils/constant';
import { scrollToFirstError } from '@/utils';
import { Document } from '@/components/DocumentDrawer';

import { NS, DEFAULT_VALUES } from '../../constants';
import { ChannelItem } from '../../types';
import ContactKeysSelect from './ContactKeysSelect';
import HTTP from './HTTP';
import SMTP from './SMTP';
import Script from './Script';
import Flashduty from './Flashduty';

interface Props {
  initialValues?: ChannelItem;
  onOk: (values: ChannelItem) => void;
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const [form] = Form.useForm();
  const requestType = Form.useWatch('request_type', form);
  const requestContentRef = React.useRef<HTMLDivElement>(null);
  const requestContentSize = useSize(requestContentRef);

  return (
    <Form form={form} layout='vertical' initialValues={props.initialValues ?? DEFAULT_VALUES}>
      <Card className='mb2' title={<Space>{t('basic_configuration')}</Space>}>
        <Form.Item name='id' hidden>
          <Input />
        </Form.Item>
        <Row gutter={SIZE}>
          <Col flex='auto'>
            <Row gutter={SIZE}>
              <Col span={12}>
                <Form.Item label={t('common:table.name')} name='name' rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={t('common:table.ident')} tooltip={t('ident_tip')} name='ident' rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col flex='none'>
            <Form.Item label={t('common:table.enabled')} tooltip={t('enable_tip')} name='enable' valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('common:table.note')} name='description' tooltip={t('note_tip')} className='mb0'>
          <Input.TextArea />
        </Form.Item>
      </Card>
      <Form.Item name='request_type'>
        <Segmented
          options={[
            {
              label: (
                <div className='n9e-flex n9e-items-center n9e-gap-1'>
                  <img height={16} src='/image/notification/http.png' />
                  {t('http_request_config.title')}
                </div>
              ),
              value: 'http',
            },
            {
              label: (
                <div className='n9e-flex n9e-items-center n9e-gap-1'>
                  <img height={16} src='/image/notification/smtp.png' />
                  {t('smtp_request_config.title')}
                </div>
              ),
              value: 'smtp',
            },
            {
              label: (
                <div className='n9e-flex n9e-items-center n9e-gap-1'>
                  <img height={16} src='/image/notification/script.png' />
                  {t('script_request_config.title')}
                </div>
              ),
              value: 'script',
            },
            {
              label: (
                <div className='n9e-flex n9e-items-center n9e-gap-1'>
                  <img height={16} src='/image/notification/flashduty.png' />
                  {t('flashduty_request_config.title')}
                </div>
              ),
              value: 'flashduty',
            },
          ]}
        />
      </Form.Item>
      <Row gutter={SIZE * 2}>
        <Col span={12}>
          <div ref={requestContentRef}>
            <Card
              className='mb2'
              title={<Space>{t('variable_configuration.title')}</Space>}
              style={{
                display: _.includes(['http', 'script'], requestType) ? 'block' : 'none',
              }}
            >
              <ContactKeysSelect showSearch optionFilterProp='label' allowClear />
              <Form.List name={['param_config', 'custom', 'params']}>
                {(fields, { add, remove }) => (
                  <>
                    <div className='mb1'>
                      <Space size={4}>
                        {t('variable_configuration.params.title')}
                        <Tooltip className='n9e-ant-from-item-tooltip' title={t('variable_configuration.params.title_tip')}>
                          <QuestionCircleOutlined />
                        </Tooltip>
                        <PlusCircleOutlined
                          onClick={() =>
                            add({
                              type: 'string',
                            })
                          }
                        />
                      </Space>
                    </div>
                    {fields.length ? (
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
                    ) : null}
                    {fields.map(({ key, name, ...restField }) => (
                      <Row gutter={SIZE} key={key}>
                        <Col flex='auto'>
                          <Row gutter={SIZE}>
                            <Form.Item {...restField} name={[name, 'type']} hidden>
                              <Input />
                            </Form.Item>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, 'key']}>
                                <Input />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, 'cname']}>
                                <Input />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                        <Col flex='none'>
                          <MinusCircleOutlined className='mt1' onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
                  </>
                )}
              </Form.List>
            </Card>
            <Card className='mb2' title={<Space size={4}>{t(`request_configuration.${requestType}`)}</Space>}>
              <HTTP />
              <SMTP />
              <Script />
              <Flashduty />
            </Card>
          </div>
        </Col>
        <Col span={12}>
          <Card
            style={{
              height: requestContentSize?.height,
              overflow: 'auto',
            }}
          >
            {requestType && <Document documentPath={`/docs/notification-channel/${requestType}-request`} />}
          </Card>
        </Col>
      </Row>
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
