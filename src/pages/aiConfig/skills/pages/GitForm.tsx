import React from 'react';
import { Form, Input, Select, Row, Col } from 'antd';
import { FormInstance } from 'antd/es/form';
import { useTranslation } from 'react-i18next';

import { SIZE } from '@/utils/constant';

import { NS } from '../constants';
import { GitAuthType, GitRefType } from '../types';

export type GitFormMode = 'install' | 'replace' | 'update';
export type GitFormDisabledField = 'git_url' | 'git_ref_type' | 'git_ref' | 'git_auth_type' | 'git_token' | 'git_subdir';

interface Props {
  form: FormInstance;
  mode: GitFormMode;
  disabledFields?: GitFormDisabledField[];
  currentRefHint?: {
    ref_type: GitRefType;
    ref: string;
  };
}

const REF_TYPE_OPTIONS: { value: GitRefType; labelKey: string }[] = [
  { value: 'branch', labelKey: 'git.ref_type_branch' },
  { value: 'tag', labelKey: 'git.ref_type_tag' },
  { value: 'commit', labelKey: 'git.ref_type_commit' },
];

const AUTH_TYPE_OPTIONS: { value: GitAuthType; labelKey: string }[] = [
  { value: 'none', labelKey: 'git.field_auth_none' },
  { value: 'token', labelKey: 'git.field_auth_token' },
];

export default function GitForm(props: Props) {
  const { t } = useTranslation(NS);
  const { form, mode, disabledFields = [], currentRefHint } = props;
  const refType = Form.useWatch<GitRefType | undefined>('git_ref_type', form) ?? 'branch';
  const authType = Form.useWatch<GitAuthType | undefined>('git_auth_type', form) ?? 'none';

  const isDisabled = (field: GitFormDisabledField) => disabledFields.includes(field);

  const refLabel = (() => {
    if (refType === 'tag') return t('git.field_ref_tag');
    if (refType === 'commit') return t('git.field_ref_commit');
    return t('git.field_ref_branch');
  })();

  const tokenLabel = t('git.field_token');
  const tokenPlaceholder = mode === 'replace' ? t('git.field_token_replace_placeholder') : t('git.field_token_placeholder');
  const tokenRequired = mode !== 'replace' && authType === 'token';

  return (
    <Form
      form={form}
      layout='vertical'
      initialValues={{
        git_ref_type: 'branch',
        git_auth_type: 'none',
      }}
    >
      <Form.Item label={t('git.field_url')} name='git_url' rules={[{ required: true }, { pattern: /^https?:\/\/.+/, message: t('git.field_url_http_only') }]}>
        <Input placeholder={t('git.field_url_placeholder')} disabled={isDisabled('git_url')} />
      </Form.Item>
      {mode === 'update' && currentRefHint ? (
        <div className='mb-4 p-2 rounded-lg bg-fc-200'>
          {t('git.current_ref_hint', {
            ref_type: currentRefHint.ref_type,
            ref: currentRefHint.ref,
          })}
        </div>
      ) : null}
      <Row gutter={SIZE}>
        <Col span={8}>
          <Form.Item label={t('git.field_ref_type')} name='git_ref_type' rules={[{ required: true }]}>
            <Select disabled={isDisabled('git_ref_type')}>
              {REF_TYPE_OPTIONS.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item label={refLabel} name='git_ref' rules={[{ required: true }]}>
            <Input placeholder={refType === 'branch' ? 'main' : ''} disabled={isDisabled('git_ref')} />
          </Form.Item>
        </Col>
      </Row>
      {mode !== 'update' && (
        <>
          <Form.Item label={t('git.field_subdir')} name='git_subdir'>
            <Input placeholder={t('git.field_subdir_placeholder')} disabled={isDisabled('git_subdir')} />
          </Form.Item>
          <Form.Item label={t('git.field_auth_type')} name='git_auth_type'>
            <Select disabled={isDisabled('git_auth_type')}>
              {AUTH_TYPE_OPTIONS.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {authType === 'token' && (
            <Form.Item
              label={tokenLabel}
              name='git_token'
              rules={tokenRequired ? [{ required: true }] : undefined}
              extra={
                <div className='text-soft'>
                  <div>{t('git.token_hint_1')}</div>
                  <div>{t('git.token_hint_2')}</div>
                </div>
              }
            >
              <Input.Password placeholder={tokenPlaceholder} disabled={isDisabled('git_token')} autoComplete='new-password' />
            </Form.Item>
          )}
        </>
      )}
    </Form>
  );
}
