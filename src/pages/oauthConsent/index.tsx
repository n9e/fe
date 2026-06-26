/*
 * Copyright 2024 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

// Consent screen for the built-in MCP/A2A OAuth Authorization Server.
//
// The backend GET /oauth/authorize validates the request and 302-redirects the
// browser here with a signed `req` ticket. Because n9e uses a header/Bearer
// session (no cookie), the consent decision is taken in the SPA: this page is
// inside the authenticated routes, so an unauthenticated visit round-trips
// through /login (incl. SSO) first; once authenticated it POSTs the decision to
// the protected API which mints the authorization code, then navigates the
// browser back to the client's redirect_uri.
import React, { useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import { Card, Button, Space, Typography, Result } from 'antd';
import { ApiOutlined } from '@ant-design/icons';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { CommonStateContext } from '@/App';

import { NAME_SPACE } from './constants';

const { Paragraph, Text } = Typography;

// decodeJwtPayload reads a JWT's payload for display only (no signature check —
// the backend re-verifies the signed ticket when the decision is submitted).
function decodeJwtPayload(token?: string | string[] | null): Record<string, any> {
  if (!token || typeof token !== 'string') return {};
  try {
    const seg = token.split('.')[1];
    if (!seg) return {};
    let b64 = seg.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return JSON.parse(decodeURIComponent(escape(window.atob(b64))));
  } catch {
    return {};
  }
}

function hostOf(uri?: string): string {
  if (!uri) return '';
  try {
    return new URL(uri).host;
  } catch {
    return uri;
  }
}

export default function OAuthConsent() {
  const { t } = useTranslation(NAME_SPACE);
  const location = useLocation();
  const { profile } = useContext(CommonStateContext);
  const req = queryString.parse(location.search).req as string | undefined;
  const claims = useMemo(() => decodeJwtPayload(req), [req]);
  const [submitting, setSubmitting] = useState<'allow' | 'deny' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientName = claims.client_name || t('unknownApp');
  const redirectHost = hostOf(claims.redirect_uri);
  const scope = claims.scope || 'mcp';
  // 该 scope 对 MCP 与 A2A 两类接口一视同仁放行（后端不按 scope 细分鉴权），
  // 显式标注 mcp/a2a，避免被误读为仅授权 MCP。
  const scopeDisplay = scope === 'mcp' ? 'mcp/a2a' : scope;

  if (!req) {
    return (
      <div className='flex items-center justify-center h-full min-h-[70vh]'>
        <Result status='error' title={t('title')} subTitle={t('invalid')} />
      </div>
    );
  }

  const decide = (decision: 'allow' | 'deny') => {
    setSubmitting(decision);
    setError(null);
    request('/api/n9e/mcp/oauth/authorize', {
      method: RequestMethod.Post,
      data: { req, decision },
    })
      .then((res) => {
        const redirect = res?.dat?.redirect;
        if (redirect) {
          window.location.href = redirect;
        } else {
          setError(t('failed'));
          setSubmitting(null);
        }
      })
      .catch(() => {
        setError(t('failed'));
        setSubmitting(null);
      });
  };

  return (
    <div className='flex items-center justify-center h-full min-h-[70vh]'>
      <Card className='w-[460px] [&>.ant-card-body]:p-7'>
        <Space direction='vertical' size={16} className='w-full'>
          <Space align='center'>
            <ApiOutlined className='text-[22px]' />
            <Typography.Title level={4} className='m-0'>
              {t('title')}
            </Typography.Title>
          </Space>

          <Paragraph className='mb-0'>{t('intro')}</Paragraph>

          <Card size='small' type='inner' title={<Text strong>{clientName}</Text>}>
            <Paragraph className='mb-1.5'>
              <Text type='secondary'>{t('asUser')}</Text>
              <Text strong>{profile?.nickname || profile?.username || '-'}</Text>
            </Paragraph>
            <Paragraph className='mb-1.5'>
              <Text type='secondary'>{t('scope')}</Text>
              <Text code>{scopeDisplay}</Text>
            </Paragraph>
            {redirectHost ? (
              <Paragraph className='mb-0'>
                <Text type='secondary'>{t('redirectTo')}</Text>
                <Text>{redirectHost}</Text>
              </Paragraph>
            ) : null}
          </Card>

          {error ? <Text type='danger'>{error}</Text> : null}

          <Space className='w-full justify-end'>
            <Button onClick={() => decide('deny')} loading={submitting === 'deny'} disabled={submitting !== null}>
              {t('deny')}
            </Button>
            <Button type='primary' onClick={() => decide('allow')} loading={submitting === 'allow'} disabled={submitting !== null}>
              {t('allow')}
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
