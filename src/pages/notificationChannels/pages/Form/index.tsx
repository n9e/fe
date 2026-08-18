import React, { useEffect } from 'react';
import _ from 'lodash';
import { Form, Space, Input, Switch, Button, Row, Col, Tooltip } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { SIZE } from '@/utils/constant';
import { scrollToFirstError } from '@/utils';
import { getPageFromSearch } from '@/utils/urlPage';
import { Document } from '@/components/DocumentDrawer';
import Splitter from '@/components/Splitter';

import { NS, getChannelTypeMeta } from '../../constants';
import { ChannelItem } from '../../types';
import ContactKeysSelect from './ContactKeysSelect';
import HTTP from './HTTP';
import SMTP from './SMTP';
import Script from './Script';
import Flashduty from './Flashduty';
import Pagerduty from './Pagerduty';
import DingtalkApp from './DingtalkApp';
import WecomApp from './WecomApp';
import FeishuApp from './FeishuApp';
import TestModal from './TestModal';

interface Props {
  initialValues?: ChannelItem;
  onOk: (values: ChannelItem) => void;
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const location = useLocation();
  const [form] = Form.useForm();
  const requestType = Form.useWatch('request_type', form);
  const ident = Form.useWatch('ident', form);
  const isKnownType = getChannelTypeMeta(ident).known;

  useEffect(() => {
    form.setFieldsValue(props.initialValues);
  }, []);

  return (
    <Form form={form} layout='vertical' className='h-full'>
      <div className='h-full bg-fc-100'>
        <Splitter>
          <Splitter.Panel>
            <div className='h-full flex flex-col justify-between overflow-hidden'>
              <div className='h-full min-h-0 best-looking-scroll'>
                <div className='mb-1 px-4 py-3 pt-4'>
                  <div className='font-bolder flex items-center gap-1 text-l1'>{t('basic_configuration')}</div>
                </div>
                <div className='px-6 pb-1 border-b border-fc-200'>
                  <Form.Item name='id' hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item name='ident' hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item name='request_type' hidden>
                    <Input />
                  </Form.Item>
                  <Row gutter={SIZE}>
                    <Col flex='auto'>
                      <Form.Item label={t('common:table.name')} name='name' rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col flex='none'>
                      <Form.Item label={t('common:table.enabled')} tooltip={t('enable_tip')} name='enable' valuePropName='checked'>
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label={t('common:table.note')} name='description' tooltip={t('note_tip')}>
                    <Input.TextArea />
                  </Form.Item>
                </div>
                <div
                  style={{
                    display: _.includes(['http', 'script'], requestType) ? 'block' : 'none',
                  }}
                >
                  <div className='mb-1 px-4 py-3 pt-4'>
                    <div className='font-bolder flex items-center gap-1 text-l1'>{t('variable_configuration.title')}</div>
                  </div>
                  <div className='px-6 pb-1 border-b border-fc-200'>
                    <ContactKeysSelect showSearch optionFilterProp='label' allowClear />
                    <Form.List name={['param_config', 'custom', 'params']}>
                      {(fields, { add, remove }) => (
                        <>
                          <div className='mb-2'>
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
                            <Row gutter={SIZE} className='mb-2'>
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
                                <MinusCircleOutlined className='mt-2' onClick={() => remove(name)} />
                              </Col>
                            </Row>
                          ))}
                        </>
                      )}
                    </Form.List>
                  </div>
                </div>
                <div className='mb-1 px-4 py-3 pt-4'>
                  <div className='font-bolder flex items-center gap-1 text-l1'>{t(`request_configuration.${requestType}`)}</div>
                </div>
                <div className='px-6'>
                  <HTTP />
                  <SMTP />
                  <Script />
                  <Flashduty />
                  <Pagerduty />
                  <DingtalkApp />
                  <WecomApp />
                  <FeishuApp />
                </div>
              </div>
              <div className='border-t border-fc-200 px-4 py-3'>
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
                          // 校验失败带 errorFields，由 antd 自行标红；其余异常才是真错误，
                          // 一并 console.error 会让真异常淹没在日常的校验失败里
                          if (!err?.errorFields) {
                            console.error(err);
                          }
                          scrollToFirstError();
                        });
                    }}
                  >
                    {t('common:btn.save')}
                  </Button>
                  {/* 测试放在保存旁边：配完就能验证，不必先存下来再回来试 */}
                  <TestModal
                    form={form}
                    onBeforeOpen={() =>
                      form.validateFields().catch((err) => {
                        if (!err?.errorFields) {
                          console.error(err);
                        }
                        scrollToFirstError();
                        throw err;
                      })
                    }
                  />
                  <Link to={{ pathname: `/${NS}`, search: `?page=${getPageFromSearch(location.search)}` }}>
                    <Button>{t('common:btn.cancel')}</Button>
                  </Link>
                </Space>
              </div>
            </div>
          </Splitter.Panel>
          <Splitter.Panel>
            <div className='p-4 best-looking-scroll h-full'>
              {/* 未知 ident（历史数据、自建 script 媒介）在官网上没有对应文档页，
                  直接拼 URL 会让整个右栏渲染一张带营销 banner 的 404 页。
                  这类回落到仓库内按 request_type 组织的本地文档。 */}
              {requestType && isKnownType && (
                <Document type='iframe' documentPath={`https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/notify-channel/${ident}/`} />
              )}
              {requestType && !isKnownType && <Document documentPath={`/n9e-docs/notification-channel/${requestType}-request`} />}
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
    </Form>
  );
}
