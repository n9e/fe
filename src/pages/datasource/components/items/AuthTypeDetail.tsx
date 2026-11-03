import React from 'react';
import { Col, Row } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

const AUTH_TYPE_LABELS: Record<string, string> = {
  sigv4: 'AWS SigV4',
  oauth2: 'OAuth2',
  azure: 'Azure Entra ID',
};

/**
 * 详情页展示云鉴权方式（SigV4 / OAuth2 / Azure），Basic Auth 仍由各数据源详情页自己展示
 */
export default function AuthTypeDetail({ auth }: { auth?: any }) {
  const { t } = useTranslation('datasourceManage');
  const label = AUTH_TYPE_LABELS[auth?.type];
  if (!label) return null;

  let extra: string | undefined;
  if (auth.type === 'sigv4') {
    extra = _.compact([auth.sigv4?.region, auth.sigv4?.service_name, auth.sigv4?.role_arn]).join(' / ');
  } else if (auth.type === 'oauth2') {
    extra = auth.oauth2?.token_url;
  } else if (auth.type === 'azure') {
    extra = _.compact([auth.azure?.cloud, auth.azure?.credential_type]).join(' / ');
  }

  return (
    <div className='flash-cat-block'>
      <Row gutter={16}>
        <Col span={24}>{t('form.cloud_auth.auth_type')}：</Col>
        <Col span={24} className='second-color'>
          {extra ? `${label} (${extra})` : label}
        </Col>
      </Row>
    </div>
  );
}
