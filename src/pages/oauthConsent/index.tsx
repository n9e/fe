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
import queryString from 'query-string';
import { Card, Button, Space, Typography, Result } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import i18next from 'i18next';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { CommonStateContext } from '@/App';

const { Paragraph, Text } = Typography;

const zh = i18next.language?.startsWith('zh');
const T = {
  title: zh ? '授权请求' : 'Authorization request',
  intro: zh ? '以下应用申请以你的身份访问夜莺的 MCP / A2A 接口：' : 'The following application requests to access the Nightingale MCP / A2A API as you:',
  asUser: zh ? '当前登录身份' : 'Signed in as',
  redirectTo: zh ? '回调地址' : 'Redirect to',
  scope: zh ? '申请权限' : 'Requested scope',
  allow: zh ? '允许' : 'Allow',
  deny: zh ? '拒绝' : 'Deny',
  invalid: zh ? '授权请求无效或已过期，请回到客户端重新发起。' : 'The authorization request is invalid or expired. Please restart from the client.',
  failed: zh ? '处理授权时出错，请重试。' : 'Failed to process the authorization. Please try again.',
  unknownApp: zh ? '未命名应用' : 'Unnamed application',
};

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
  const location = useLocation();
  const { profile } = useContext(CommonStateContext);
  const req = queryString.parse(location.search).req as string | undefined;
  const claims = useMemo(() => decodeJwtPayload(req), [req]);
  const [submitting, setSubmitting] = useState<'allow' | 'deny' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientName = claims.client_name || T.unknownApp;
  const redirectHost = hostOf(claims.redirect_uri);
  const scope = claims.scope || 'mcp';
  // 该 scope 对 MCP 与 A2A 两类接口一视同仁放行（后端不按 scope 细分鉴权），
  // 显式标注 mcp/a2a，避免被误读为仅授权 MCP。
  const scopeDisplay = scope === 'mcp' ? 'mcp/a2a' : scope;

  if (!req) {
    return (
      <div style={wrapStyle}>
        <Result status='error' title={T.title} subTitle={T.invalid} />
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
          setError(T.failed);
          setSubmitting(null);
        }
      })
      .catch(() => {
        setError(T.failed);
        setSubmitting(null);
      });
  };

  return (
    <div style={wrapStyle}>
      <Card style={{ width: 460 }} bodyStyle={{ padding: 28 }}>
        <Space direction='vertical' size={16} style={{ width: '100%' }}>
          <Space align='center'>
            <ApiOutlined style={{ fontSize: 22 }} />
            <Typography.Title level={4} style={{ margin: 0 }}>
              {T.title}
            </Typography.Title>
          </Space>

          <Paragraph style={{ marginBottom: 0 }}>{T.intro}</Paragraph>

          <Card size='small' type='inner' title={<Text strong>{clientName}</Text>}>
            <Paragraph style={{ marginBottom: 6 }}>
              <Text type='secondary'>{T.asUser}：</Text>
              <Text strong>{profile?.nickname || profile?.username || '-'}</Text>
            </Paragraph>
            <Paragraph style={{ marginBottom: 6 }}>
              <Text type='secondary'>{T.scope}：</Text>
              <Text code>{scopeDisplay}</Text>
            </Paragraph>
            {redirectHost ? (
              <Paragraph style={{ marginBottom: 0 }}>
                <Text type='secondary'>{T.redirectTo}：</Text>
                <Text>{redirectHost}</Text>
              </Paragraph>
            ) : null}
          </Card>

          {error ? <Text type='danger'>{error}</Text> : null}

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => decide('deny')} loading={submitting === 'deny'} disabled={submitting !== null}>
              {T.deny}
            </Button>
            <Button type='primary' onClick={() => decide('allow')} loading={submitting === 'allow'} disabled={submitting !== null}>
              {T.allow}
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  minHeight: '70vh',
};
