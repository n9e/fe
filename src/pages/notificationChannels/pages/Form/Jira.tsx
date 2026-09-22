import React from 'react';
import { Alert, Collapse, Form, Input, InputNumber, Radio, Space, Switch, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';
import CredentialCheck from './CredentialCheck';

const names = ['request_config', 'jira_request_config'];

/** 含 {{ 的值是变量配置引用，发送时才展开，不做格式校验（与后端 JiraRequestConfig.Verify 一致） */
const isVarRef = (v?: string) => !!v && v.includes('{{');

export default function Jira() {
  const { t } = useTranslation(NS);
  const request_type = Form.useWatch('request_type');
  const tokenType = Form.useWatch([...names, 'token_type']);
  const isJira = request_type === 'jira';

  const label = (key: string) => (
    <Space size={4}>
      {t(`jira_request_config.${key}`)}
      <Tooltip className='n9e-ant-from-item-tooltip' overlayClassName='ant-tooltip-max-width-600' title={t(`jira_request_config.${key}_tip`)}>
        <QuestionCircleOutlined />
      </Tooltip>
    </Space>
  );

  return (
    <div style={{ display: isJira ? 'block' : 'none' }}>
      <Alert className='mb-4' type='info' showIcon message={t('jira_request_config.top_tip')} />
      {/* Data Center 后续支持，当前固定 Cloud。
          这里的字段都不设 initialValue：各媒介的分表单常驻挂载，带默认值的字段会让其他类型的媒介也提交一份
          jira_request_config（normalizeFormValues 只剔除全空的配置）。默认值放在类型表的 default_values 里。 */}
      <Form.Item name={[...names, 'deployment_type']} hidden>
        <Input />
      </Form.Item>
      <Form.Item
        label={label('site_url')}
        name={[...names, 'site_url']}
        validateTrigger='onBlur'
        rules={[
          { required: isJira },
          {
            validator: (_rule, value?: string) => {
              if (!isJira || !value || isVarRef(value) || /^https?:\/\/[^/\s]+/i.test(value.trim())) return Promise.resolve();
              return Promise.reject(new Error(t('jira_request_config.site_url_invalid')));
            },
          },
        ]}
      >
        <Input placeholder='https://your-domain.atlassian.net' />
      </Form.Item>
      <Form.Item label={label('token_type')} name={[...names, 'token_type']} rules={[{ required: isJira }]}>
        <Radio.Group>
          <Radio value='scoped'>{t('jira_request_config.token_scoped')}</Radio>
          <Radio value='classic'>{t('jira_request_config.token_classic')}</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={label('email')} name={[...names, 'email']} rules={[{ required: isJira }]}>
        {/* 服务账号只能建带权限范围的令牌；普通令牌一定属于个人账号，占位符别再给服务账号的示例 */}
        <Input placeholder={tokenType === 'classic' ? 'you@company.com' : 'alerts-xxxx@serviceaccount.atlassian.com'} />
      </Form.Item>
      <Form.Item label={label('api_token')} name={[...names, 'api_token']} rules={[{ required: isJira }]}>
        <Input.Password autoComplete='new-password' />
      </Form.Item>
      {tokenType !== 'classic' && (
        <Form.Item label={label('cloud_id')} name={[...names, 'cloud_id']}>
          <Input placeholder={t('jira_request_config.cloud_id_placeholder')} />
        </Form.Item>
      )}
      <CredentialCheck
        fields={[
          [...names, 'site_url'],
          [...names, 'email'],
          [...names, 'api_token'],
        ]}
      />

      <Collapse ghost className='n9e-collapse-advanced-settings'>
        <Collapse.Panel key='advanced' header={t('advanced_settings')} forceRender>
          <Form.Item label={t('http_request_config.proxy')} tooltip={t('jira_request_config.proxy_tip')} name={[...names, 'proxy']}>
            <Input placeholder='http://127.0.0.1:7890' />
          </Form.Item>
          <Space>
            <Form.Item label={t('http_request_config.timeout')} name={[...names, 'timeout']}>
              <InputNumber min={1} className='w-full' />
            </Form.Item>
            <Form.Item label={t('http_request_config.retry_times')} name={[...names, 'retry_times']}>
              <InputNumber min={0} className='w-full' />
            </Form.Item>
            <Form.Item label={t('http_request_config.retry_interval')} name={[...names, 'retry_sleep']}>
              <InputNumber min={0} className='w-full' />
            </Form.Item>
          </Space>
          <Form.Item label={t('jira_request_config.insecure_skip_verify')} name={[...names, 'insecure_skip_verify']} valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}
