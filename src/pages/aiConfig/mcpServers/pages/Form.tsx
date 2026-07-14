import React, { useContext } from 'react';
import { Form, Input, Row, Col, Button, Switch, Alert, Radio, Tag, Space, Typography, Collapse, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/es/form';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';

import { NS } from '../constants';
import { OAuthStatus } from '../types';
import useUserGroups from '../useUserGroups';

interface OAuthProps {
  status: OAuthStatus | null;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

interface Props {
  form: FormInstance;
  oauth?: OAuthProps;
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const { form, oauth } = props;
  const { profile } = useContext(CommonStateContext);
  // 仅管理员可选择「可见范围」（公开/私有）；非管理员只能创建/管理私有 MCP Server
  const isAdmin = !!profile.roles?.includes('Admin');
  const authMode = Form.useWatch('auth_mode', form) ?? 'none';
  const redirectURI = `${window.location.origin}/api/n9e/mcp-server-oauth/callback`;
  const { options: userGroupOptions } = useUserGroups();

  return (
    <Form form={form} layout='vertical'>
      <Row gutter={SIZE}>
        <Col flex='auto'>
          <Form.Item label={t('name')} name='name' rules={[{ required: true }]}>
            <Input placeholder={t('form.name_placeholder')} />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Form.Item label={t('enabled')} name='enabled' valuePropName='checked' initialValue={true}>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label={t('description')} name='description'>
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder={t('form.description_placeholder')} />
      </Form.Item>

      <Form.Item label={t('scope.teams')} name='user_group_ids' tooltip={t('scope.teams_tip')} rules={[{ required: true }]}>
        <Select showSearch mode='multiple' optionFilterProp='label' placeholder={t('scope.teams_placeholder')} options={userGroupOptions} />
      </Form.Item>

      {isAdmin ? (
        <Form.Item label={t('scope.title')} name='private' initialValue={1} tooltip={t('scope.tip')}>
          <Radio.Group>
            <Radio value={0}>{t('scope.public')}</Radio>
            <Radio value={1}>{t('scope.private')}</Radio>
          </Radio.Group>
        </Form.Item>
      ) : (
        // 非管理员不展示「可见范围」，但仍需在表单中携带 private=1 一并提交（后端亦会强制）
        <Form.Item name='private' initialValue={1} hidden>
          <Input />
        </Form.Item>
      )}

      <Form.Item label={t('url')} name='url' rules={[{ required: true }]}>
        <Input placeholder={t('form.url_placeholder')} />
      </Form.Item>

      <Form.Item label={t('form.auth_mode')} name='auth_mode' initialValue='none'>
        <Radio.Group>
          <Radio value='none'>{t('form.auth_none')}</Radio>
          <Radio value='header'>{t('form.auth_header')}</Radio>
          <Radio value='oauth'>{t('form.auth_oauth')}</Radio>
        </Radio.Group>
      </Form.Item>

      {authMode === 'header' && (
        <Form.Item label={t('form.headers')} tooltip={t('form.headers_tip')}>
          <Form.List name='headers'>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={SIZE}>
                    <Col flex='auto'>
                      <Row gutter={SIZE}>
                        <Col span={12}>
                          <Form.Item {...restField} name={[name, 'key']} rules={[{ required: true, message: '' }]}>
                            <Input placeholder={t('form.headers_key')} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item {...restField} name={[name, 'value']} rules={[{ required: true, message: '' }]}>
                            <Input placeholder={t('form.headers_value')} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col flex='none'>
                      <Button type='text' onClick={() => remove(name)} icon={<MinusCircleOutlined />} />
                    </Col>
                  </Row>
                ))}
                <Button className='w-full' type='dashed' onClick={() => add()} icon={<PlusOutlined />}>
                  {t('form.add_header')}
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
      )}

      {authMode === 'oauth' && (
        <>
          <Alert className='mb-2' type='info' message={t('form.oauth_title')} description={t('form.oauth_desc')} />
          {oauth && (
            <Form.Item label={t('form.oauth_connection')}>
              <Space>
                {oauth.status?.connected ? (
                  <>
                    <Tag color='success'>{t('form.oauth_connected')}</Tag>
                    {oauth.status.connected_by && <Typography.Text type='secondary'>{oauth.status.connected_by}</Typography.Text>}
                    <Button size='small' icon={<LinkOutlined />} loading={oauth.connecting} onClick={oauth.onConnect}>
                      {t('form.oauth_reconnect')}
                    </Button>
                    <Button size='small' danger icon={<DisconnectOutlined />} onClick={oauth.onDisconnect}>
                      {t('form.oauth_disconnect')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Tag>{t('form.oauth_not_connected')}</Tag>
                    <Button type='primary' size='small' icon={<LinkOutlined />} loading={oauth.connecting} onClick={oauth.onConnect}>
                      {t('form.oauth_connect')}
                    </Button>
                  </>
                )}
              </Space>
            </Form.Item>
          )}
          <Collapse ghost className='mb-2 [&_.ant-collapse-content-box]:px-0 [&_.ant-collapse-header]:px-0'>
            <Collapse.Panel key='adv' forceRender header={t('form.oauth_advanced')}>
              <Form.Item label={t('form.oauth_redirect_uri')} tooltip={t('form.oauth_redirect_uri_tip')}>
                <Input readOnly value={redirectURI} />
              </Form.Item>
              <Row gutter={SIZE}>
                <Col span={12}>
                  <Form.Item label={t('form.oauth_client_id')} name='oauth_client_id' tooltip={t('form.oauth_client_id_tip')}>
                    <Input placeholder={t('form.oauth_client_id_placeholder')} autoComplete='off' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={t('form.oauth_client_secret')} name='oauth_client_secret'>
                    <Input.Password placeholder={t('form.oauth_client_secret_placeholder')} autoComplete='new-password' />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item className='mb-0' label={t('form.oauth_scope')} name='oauth_scope' tooltip={t('form.oauth_scope_tip')}>
                <Input placeholder={t('form.oauth_scope_placeholder')} />
              </Form.Item>
            </Collapse.Panel>
          </Collapse>
        </>
      )}
    </Form>
  );
}
