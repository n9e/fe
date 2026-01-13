import React, { useEffect, useState } from 'react';
import { Button, Space, Form, message, Switch, Input, Row, Col, Select } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { EditorView } from '@codemirror/view';

import { SIZE } from '@/utils/constant';
import { getRoles } from '@/services/manage';
import CodeMirror from '@/components/CodeMirror';
import DocumentDrawer from '@/components/DocumentDrawer';

import { SSOConfigType } from './types';
import { putSSOConfig } from './services';

export const documentMap = {
  OAuth2: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/system-configuration/sso/oauth2/',
  LDAP: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/system-configuration/sso/ldap/',
  CAS: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/system-configuration/sso/cas/',
  OIDC: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/system-configuration/sso/oidc/',
  dingtalk: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/system-configuration/sso/dingtalk',
  feishu: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/system-configuration/sso/feishu',
};

interface Props {
  activeKey?: string;
  item: SSOConfigType;
}

export default function Item(props: Props) {
  const { t, i18n } = useTranslation('SSOConfigs');
  const { activeKey, item } = props;
  const [form] = Form.useForm<SSOConfigType>();
  const [advancedSettingsVisible, setAdvancedSettingsVisible] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    getRoles()
      .then((res) => {
        const roleNames = _.map(res, 'name');
        const defaultRole = _.includes(roleNames, 'Standard') ? 'Standard' : roleNames[0];
        setRoles(roleNames);
        form.setFieldsValue({
          ...item,
          setting: {
            ...item.setting,
            default_roles: item.setting?.default_roles || [defaultRole],
          },
        });
      })
      .catch(() => {
        form.setFieldsValue(item);
      });
  }, []);

  return (
    <Form form={form} layout='vertical'>
      {item.name === 'feishu' ? (
        <>
          <Form.Item name={['setting', 'redirect_url']} hidden initialValue={`${window.location.origin}/callback/feishu`}>
            <Input />
          </Form.Item>
          <Form.Item label={t('dingtalk_setting.enable')} name={['setting', 'enable']} valuePropName='checked' initialValue={false}>
            <Switch size='small' />
          </Form.Item>
          <Form.Item label={t('dingtalk_setting.display_name')} name={['setting', 'display_name']} rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label={'APP ID'}
            name={['setting', 'app_id']}
            rules={[{ required: true }]}
            tooltip={<Trans ns='SSOConfigs' i18nKey='feishu_setting.app_id_tip' components={{ 1: <a href='https://open.feishu.cn/app' target='_blank' /> }} />}
          >
            <Input />
          </Form.Item>
          <Form.Item label={'APP Secret'} name={['setting', 'app_secret']} rules={[{ required: true }]} tooltip={t('feishu_setting.app_secret_tip')}>
            <Input.Password />
          </Form.Item>
          <Form.Item
            label={t('dingtalk_setting.cover_attributes')}
            tooltip={t('feishu_setting.cover_attributes_tip')}
            name={['setting', 'cover_attributes']}
            valuePropName='checked'
            initialValue={true}
          >
            <Switch size='small' />
          </Form.Item>
          <Row gutter={SIZE}>
            <Col span={12}>
              <Form.Item label={t('dingtalk_setting.username_field')} name={['setting', 'username_field']} rules={[{ required: true }]} initialValue='email'>
                <Select
                  options={[
                    {
                      label: t('dingtalk_setting.username_field_map.email'),
                      value: 'email',
                    },
                    {
                      label: t('dingtalk_setting.username_field_map.phone'),
                      value: 'phone',
                    },
                    {
                      label: t('dingtalk_setting.username_field_map.name'),
                      value: 'name',
                    },
                  ]}
                  optionFilterProp='label'
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('dingtalk_setting.default_roles')} name={['setting', 'default_roles']} rules={[{ required: true }]}>
                <Select
                  mode='multiple'
                  options={_.map(roles, (item) => {
                    return { label: item, value: item };
                  })}
                  optionFilterProp='label'
                />
              </Form.Item>
            </Col>
          </Row>

          <div className='mb-4'>
            <Space className='cursor-pointer' onClick={() => setAdvancedSettingsVisible(!advancedSettingsVisible)}>
              {t('common:advanced_settings')}
              {advancedSettingsVisible ? <DownOutlined /> : <RightOutlined />}
            </Space>
          </div>
          <div
            style={{
              display: advancedSettingsVisible ? 'block' : 'none',
            }}
          >
            <Form.Item label={t('dingtalk_setting.auth_url')} name={['setting', 'auth_url']} initialValue={'https://accounts.feishu.cn/open-apis/authen/v1/authorize'}>
              <Input placeholder='https://accounts.feishu.cn/open-apis/authen/v1/authorize' />
            </Form.Item>
            <Form.Item label='Endpoint' name={['setting', 'feishu_endpoint']} initialValue={'https://open.feishu.cn'}>
              <Input placeholder='https://open.feishu.cn' />
            </Form.Item>
            <Form.Item label={t('dingtalk_setting.proxy')} name={['setting', 'proxy']}>
              <Input />
            </Form.Item>
          </div>
        </>
      ) : item.name === 'dingtalk' ? (
        <>
          <Form.Item name={['setting', 'redirect_url']} hidden initialValue={`${window.location.origin}/callback/dingtalk`}>
            <div />
          </Form.Item>
          <Form.Item label={t('dingtalk_setting.enable')} name={['setting', 'enable']} valuePropName='checked' initialValue={false}>
            <Switch size='small' />
          </Form.Item>
          <Row gutter={SIZE}>
            <Col span={12}>
              <Form.Item label={t('dingtalk_setting.display_name')} name={['setting', 'display_name']} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('dingtalk_setting.corpId')} tooltip={t('dingtalk_setting.corpId_tip')} name={['setting', 'corpId']} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t('dingtalk_setting.client_id')} name={['setting', 'client_id']} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t('dingtalk_setting.client_secret')} name={['setting', 'client_secret']} rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item
            label={t('dingtalk_setting.cover_attributes')}
            tooltip={t('dingtalk_setting.cover_attributes_tip')}
            name={['setting', 'cover_attributes']}
            valuePropName='checked'
            initialValue={true}
          >
            <Switch size='small' />
          </Form.Item>
          <Row gutter={SIZE}>
            <Col span={12}>
              <Form.Item label={t('dingtalk_setting.username_field')} name={['setting', 'username_field']} rules={[{ required: true }]}>
                <Select
                  options={[
                    {
                      label: t('dingtalk_setting.username_field_map.phone'),
                      value: 'phone',
                    },
                    {
                      label: t('dingtalk_setting.username_field_map.name'),
                      value: 'name',
                    },
                    {
                      label: t('dingtalk_setting.username_field_map.email'),
                      value: 'email',
                    },
                  ]}
                  optionFilterProp='label'
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('dingtalk_setting.default_roles')} name={['setting', 'default_roles']} rules={[{ required: true }]}>
                <Select
                  mode='multiple'
                  options={_.map(roles, (item) => {
                    return { label: item, value: item };
                  })}
                  optionFilterProp='label'
                />
              </Form.Item>
            </Col>
          </Row>

          <div className='mb-4'>
            <Space className='cursor-pointer' onClick={() => setAdvancedSettingsVisible(!advancedSettingsVisible)}>
              {t('common:advanced_settings')}
              {advancedSettingsVisible ? <DownOutlined /> : <RightOutlined />}
            </Space>
          </div>
          <div
            style={{
              display: advancedSettingsVisible ? 'block' : 'none',
            }}
          >
            <Form.Item label={t('dingtalk_setting.auth_url')} name={['setting', 'auth_url']}>
              <Input placeholder='https://login.dingtalk.com/oauth2/auth' />
            </Form.Item>
            <Form.Item label='Endpoint' name={['setting', 'endpoint']}>
              <Input placeholder='https://api.dingtalk.com' />
            </Form.Item>
            <Form.Item label={t('dingtalk_setting.proxy')} name={['setting', 'proxy']}>
              <Input />
            </Form.Item>
            <Row gutter={SIZE}>
              <Col flex='none'>
                <Form.Item
                  label={t('dingtalk_setting.use_member_info')}
                  tooltip={t('dingtalk_setting.use_member_info_tip')}
                  name={['setting', 'use_member_info']}
                  valuePropName='checked'
                  initialValue={false}
                >
                  <Switch size='small' />
                </Form.Item>
              </Col>
              <Col flex='auto'>
                <Form.Item label={t('dingtalk_setting.dingtalk_api')} tooltip={t('dingtalk_setting.dingtalk_api_tip')} name={['setting', 'dingtalk_api']}>
                  <Input placeholder='https://oapi.dingtalk.com' />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </>
      ) : (
        <Form.Item name='content'>
          <CodeMirror
            height='auto'
            basicSetup
            editable
            extensions={[
              EditorView.lineWrapping,
              EditorView.theme({
                '&': {
                  backgroundColor: '#F6F6F6 !important',
                },
                '&.cm-editor.cm-focused': {
                  outline: 'unset',
                },
              }),
            ]}
          />
        </Form.Item>
      )}
      <Space className='mt-4'>
        <Button
          type='primary'
          onClick={() => {
            form.validateFields().then((values) => {
              putSSOConfig({
                ...item,
                ...values,
              }).then(() => {
                message.success(t('common:success.save'));
              });
            });
          }}
        >
          {t('common:btn.save')}
        </Button>
        {activeKey && documentMap[activeKey] && (
          <Button
            type='link'
            onClick={() => {
              DocumentDrawer({
                language: i18n.language,
                title: t('common:document_link'),
                type: 'iframe',
                documentPath: documentMap[activeKey],
              });
            }}
          >
            {t('common:document_link')}
          </Button>
        )}
      </Space>
    </Form>
  );
}
