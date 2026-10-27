import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Col, Form, Input, Radio, Row, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export type AuthType = 'basic' | 'sigv4' | 'oauth2' | 'azure';

interface AuthPolicy {
  allow_ambient_credentials: boolean;
  allow_assume_role: boolean;
  sigv4_allowed_services: string[];
  azure_default_scopes: Record<string, string>;
}

// 老后端没有这个接口时按全部放开处理，保存时仍由后端校验
const DEFAULT_POLICY: AuthPolicy = {
  allow_ambient_credentials: true,
  allow_assume_role: true,
  sigv4_allowed_services: ['aps', 'es', 'aoss'],
  azure_default_scopes: {
    AzurePublic: 'https://prometheus.monitor.azure.com/.default',
    AzureChina: 'https://prometheus.monitor.azure.cn/.default',
    AzureGovernment: 'https://prometheus.monitor.azure.us/.default',
  },
};

const SIGV4_SERVICE_LABELS: Record<string, string> = {
  aps: 'aps (Amazon Managed Service for Prometheus)',
  es: 'es (Amazon OpenSearch Service)',
  aoss: 'aoss (Amazon OpenSearch Serverless)',
};

let policyPromise: Promise<AuthPolicy> | undefined;

function getAuthPolicy(): Promise<AuthPolicy> {
  if (!policyPromise) {
    policyPromise = request('/api/n9e/datasource/auth-policy', {
      method: RequestMethod.Get,
      silence: true,
    })
      .then((res) => {
        const dat = res?.data;
        return _.isPlainObject(dat) ? { ...DEFAULT_POLICY, ...dat } : DEFAULT_POLICY;
      })
      .catch(() => {
        policyPromise = undefined;
        return DEFAULT_POLICY;
      });
  }
  return policyPromise;
}

/**
 * 键值对编辑器，value 为 Record<string, string>，对应后端 map 字段（oauth2.endpoint_params）
 */
function KeyValueInput({ value, onChange }: { value?: Record<string, string>; onChange?: (v: Record<string, string>) => void }) {
  const { t } = useTranslation('datasourceManage');
  const [rows, setRows] = useState<{ key: string; value: string }[]>(() => _.map(value, (v, k) => ({ key: k, value: v })));
  const lastValue = useRef(value);

  useEffect(() => {
    // Keep drafts (including empty rows) on local edits, but honor form loads
    // and clears instead of retaining the previous datasource's parameters.
    if (!_.isEqual(value, lastValue.current)) {
      lastValue.current = value;
      setRows(_.map(value, (v, k) => ({ key: k, value: v })));
    }
  }, [value]);

  const emit = (next: { key: string; value: string }[]) => {
    setRows(next);
    const nextValue = Object.fromEntries(next.filter((item) => item.key).map((item) => [item.key, item.value]));
    lastValue.current = nextValue;
    onChange?.(nextValue);
  };

  return (
    <div>
      {_.map(rows, (row, idx) => (
        <Row gutter={8} key={idx} className='mb-2' align='middle'>
          <Col flex='1'>
            <Input placeholder={t('form.cloud_auth.param_key')} value={row.key} onChange={(e) => emit(_.map(rows, (r, i) => (i === idx ? { ...r, key: e.target.value } : r)))} />
          </Col>
          <Col flex='1'>
            <Input
              placeholder={t('form.cloud_auth.param_value')}
              value={row.value}
              onChange={(e) => emit(_.map(rows, (r, i) => (i === idx ? { ...r, value: e.target.value } : r)))}
            />
          </Col>
          <Col>
            <MinusCircleOutlined onClick={() => emit(_.filter(rows, (_r, i) => i !== idx))} />
          </Col>
        </Row>
      ))}
      <Button type='dashed' icon={<PlusOutlined />} onClick={() => setRows([...rows, { key: '', value: '' }])}>
        {t('form.cloud_auth.add_param')}
      </Button>
    </div>
  );
}

interface Props {
  // 该数据源类型允许的认证方式
  types: AuthType[];
  // Basic Auth 的表单项，不同数据源字段位置不同（auth.* 或 settings.*）
  basic: React.ReactNode;
  // SigV4 service 默认值：Prometheus / Loki 为 aps，ES / OpenSearch 为 es
  defaultSigV4Service?: string;
}

export default function AuthMethod(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { types, basic, defaultSigV4Service = 'aps' } = props;
  const [policy, setPolicy] = useState<AuthPolicy>(DEFAULT_POLICY);
  const authType: AuthType = Form.useWatch(['auth', 'type']) || 'basic';
  const sigv4CredentialType = Form.useWatch(['auth', 'sigv4', 'credential_type']);
  const sigv4RoleArn = Form.useWatch(['auth', 'sigv4', 'role_arn']);
  const azureCloud = Form.useWatch(['auth', 'azure', 'cloud']) || 'AzurePublic';
  const azureCredentialType = Form.useWatch(['auth', 'azure', 'credential_type']);

  useEffect(() => {
    getAuthPolicy().then(setPolicy);
  }, []);

  const typeLabels: Record<AuthType, string> = {
    basic: 'Basic Auth',
    sigv4: 'AWS SigV4',
    oauth2: 'OAuth2',
    azure: 'Azure Entra ID',
  };

  const ambientTip = <Alert className='mb-4' type='info' showIcon message={t('form.cloud_auth.ambient_tip')} />;

  return (
    <>
      <div className='page-title'>{t('form.auth')}</div>
      {/* 存量数据没有 auth.type，按 basic 处理 */}
      <Form.Item name={['auth', 'type']} initialValue='basic'>
        <Radio.Group optionType='button' options={_.map(types, (typ) => ({ label: typeLabels[typ], value: typ }))} />
      </Form.Item>

      {authType === 'basic' && basic}

      {authType === 'sigv4' && (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Region' name={['auth', 'sigv4', 'region']} rules={[{ required: true }]}>
                <Input placeholder='us-east-1' autoComplete='off' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Service' name={['auth', 'sigv4', 'service_name']} initialValue={defaultSigV4Service} tooltip={t('form.cloud_auth.sigv4_service_tip')}>
                <Select options={_.map(policy.sigv4_allowed_services, (svc) => ({ label: SIGV4_SERVICE_LABELS[svc] || svc, value: svc }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('form.cloud_auth.credential_source')}
            name={['auth', 'sigv4', 'credential_type']}
            initialValue={policy.allow_ambient_credentials ? 'default' : 'keys'}
            extra={!policy.allow_ambient_credentials ? t('form.cloud_auth.ambient_disabled') : undefined}
          >
            <Radio.Group>
              <Radio value='default' disabled={!policy.allow_ambient_credentials}>
                {t('form.cloud_auth.aws_default_chain')}
              </Radio>
              <Radio value='keys'>Access Key</Radio>
            </Radio.Group>
          </Form.Item>
          {sigv4CredentialType === 'keys' ? (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label='Access Key ID' name={['auth', 'sigv4', 'access_key']} rules={[{ required: true }]}>
                  <Input autoComplete='off' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label='Secret Access Key' name={['auth', 'sigv4', 'secret_key']} rules={[{ required: true }]}>
                  <Input.Password autoComplete='new-password' />
                </Form.Item>
              </Col>
            </Row>
          ) : (
            ambientTip
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label='Assume Role ARN'
                name={['auth', 'sigv4', 'role_arn']}
                tooltip={t('form.cloud_auth.role_arn_tip')}
                extra={!policy.allow_assume_role ? t('form.cloud_auth.assume_role_disabled') : undefined}
              >
                <Input placeholder='arn:aws:iam::123456789012:role/n9e-query' autoComplete='off' disabled={!policy.allow_assume_role} />
              </Form.Item>
            </Col>
            <Col span={12}>
              {sigv4RoleArn && (
                <Form.Item label='External ID' name={['auth', 'sigv4', 'external_id']}>
                  <Input autoComplete='off' />
                </Form.Item>
              )}
            </Col>
          </Row>
          <Form.Item label={t('form.cloud_auth.sts_endpoint')} name={['auth', 'sigv4', 'sts_endpoint']} tooltip={t('form.cloud_auth.sts_endpoint_tip')}>
            <Input placeholder='https://sts.us-east-1.amazonaws.com' autoComplete='off' />
          </Form.Item>
        </>
      )}

      {authType === 'oauth2' && (
        <>
          <Form.Item label='Token URL' name={['auth', 'oauth2', 'token_url']} rules={[{ required: true }]}>
            <Input placeholder='https://idp.example.com/oauth2/token' autoComplete='off' />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Client ID' name={['auth', 'oauth2', 'client_id']} rules={[{ required: true }]}>
                <Input autoComplete='off' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Client Secret' name={['auth', 'oauth2', 'client_secret']} rules={[{ required: true }]}>
                <Input.Password autoComplete='new-password' />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label='Scopes' name={['auth', 'oauth2', 'scopes']}>
            <Select mode='tags' open={false} tokenSeparators={[' ', ',']} />
          </Form.Item>
          <Form.Item label={t('form.cloud_auth.endpoint_params')} name={['auth', 'oauth2', 'endpoint_params']} tooltip={t('form.cloud_auth.endpoint_params_tip')}>
            <KeyValueInput />
          </Form.Item>
        </>
      )}

      {authType === 'azure' && (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='Cloud' name={['auth', 'azure', 'cloud']} initialValue='AzurePublic'>
                <Select
                  options={[
                    { label: 'Azure Public', value: 'AzurePublic' },
                    { label: 'Azure China', value: 'AzureChina' },
                    { label: 'Azure US Government', value: 'AzureGovernment' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Scope' name={['auth', 'azure', 'scope']} tooltip={t('form.cloud_auth.azure_scope_tip')}>
                <Input placeholder={policy.azure_default_scopes?.[azureCloud]} autoComplete='off' />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('form.cloud_auth.identity')}
            name={['auth', 'azure', 'credential_type']}
            initialValue='client_secret'
            extra={!policy.allow_ambient_credentials ? t('form.cloud_auth.ambient_disabled') : undefined}
          >
            <Radio.Group>
              <Radio value='client_secret'>{t('form.cloud_auth.azure_client_secret')}</Radio>
              <Radio value='managed_identity' disabled={!policy.allow_ambient_credentials}>
                Managed Identity
              </Radio>
              <Radio value='workload_identity' disabled={!policy.allow_ambient_credentials}>
                Workload Identity
              </Radio>
            </Radio.Group>
          </Form.Item>
          {(azureCredentialType || 'client_secret') === 'client_secret' && (
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label='Tenant ID' name={['auth', 'azure', 'tenant_id']} rules={[{ required: true }]}>
                  <Input autoComplete='off' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label='Client ID' name={['auth', 'azure', 'client_id']} rules={[{ required: true }]}>
                  <Input autoComplete='off' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label='Client Secret' name={['auth', 'azure', 'client_secret']} rules={[{ required: true }]}>
                  <Input.Password autoComplete='new-password' />
                </Form.Item>
              </Col>
            </Row>
          )}
          {azureCredentialType === 'managed_identity' && (
            <>
              <Form.Item label='Client ID' name={['auth', 'azure', 'client_id']} tooltip={t('form.cloud_auth.azure_mi_client_id_tip')}>
                <Input autoComplete='off' />
              </Form.Item>
              {ambientTip}
            </>
          )}
          {azureCredentialType === 'workload_identity' && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label='Tenant ID' name={['auth', 'azure', 'tenant_id']} tooltip={t('form.cloud_auth.azure_wi_tip')}>
                    <Input autoComplete='off' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Client ID' name={['auth', 'azure', 'client_id']} tooltip={t('form.cloud_auth.azure_wi_tip')}>
                    <Input autoComplete='off' />
                  </Form.Item>
                </Col>
              </Row>
              {ambientTip}
            </>
          )}
        </>
      )}
    </>
  );
}
