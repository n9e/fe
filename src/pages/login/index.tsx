/*
 * Copyright 2022 Nightingale Team
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
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { getSsoConfig, getRedirectURL, getRedirectURLCAS, getRedirectURLOAuth, authLogin } from '@/services/login';
import './login.less';

import { useTranslation } from 'react-i18next';
export interface DisplayName {
  oidc: string;
  cas: string;
  oauth: string;
}
export default function Login() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const history = useHistory();
  const location = useLocation();
  const redirect = location.search && new URLSearchParams(location.search).get('redirect');
  const [displayName, setDis] = useState<DisplayName>({
    oidc: 'OIDC',
    cas: 'CAS',
    oauth: 'OAuth',
  });

  useEffect(() => {
    getSsoConfig().then((res) => {
      if (res.dat) {
        setDis({
          oidc: res.dat.oidcDisplayName,
          cas: res.dat.casDisplayName,
          oauth: res.dat.oauthDisplayName,
        });
      }
    });
  }, []);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      login();
    } catch {
      console.log(t('输入有误'));
    }
  };

  const login = async () => {
    let { username, password } = form.getFieldsValue();
    authLogin(username, password).then((res) => {
      const { dat, err } = res;
      const { access_token, refresh_token } = dat;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      if (!err) {
        window.location.href = redirect || '/metric/explorer';
      }
    });
  };

  return (
    <div className='login-warp'>
      <img src={'/image/login-left-top-corner.png'} className='left-top-bg'></img>
      <img src={'/image/login-right-bottom-corner.png'} className='right-bottom-bg'></img>
      <div className='banner integration'>
        <img src={'/image/login-dashboard.svg'} style={{ margin: '0 60px', zIndex: 5, width: 632 }}></img>
      </div>
      <div className='login-panel'>
        <div className='login-main  integration'>
          <div className='login-title'>
            <img src={'/image/logo-dark.svg'} style={{ width: '120px' }} />
          </div>
          <Form form={form} layout='vertical' requiredMark={true}>
            <Form.Item
              label='账户'
              name='username'
              rules={[
                {
                  required: true,
                  message: t('请输入用户名'),
                },
              ]}
            >
              <Input placeholder={t('请输入用户名')} prefix={<UserOutlined className='site-form-item-icon' />} />
            </Form.Item>
            <Form.Item
              label='密码'
              name='password'
              rules={[
                {
                  required: true,
                  message: t('请输入密码'),
                },
              ]}
            >
              <Input type='password' placeholder={t('请输入密码')} onPressEnter={handleSubmit} prefix={<LockOutlined className='site-form-item-icon' />} />
            </Form.Item>

            <Form.Item>
              <Button type='primary' onClick={handleSubmit}>
                {t('登录')}
              </Button>
            </Form.Item>
            <div className='login-other'>
              <strong>其他登录方式：</strong>
              <a
                onClick={() => {
                  getRedirectURL().then((res) => {
                    if (res.dat) {
                      window.location.href = res.dat;
                    } else {
                      message.warning('没有配置 OIDC 登录地址！');
                    }
                  });
                }}
              >
                {displayName.oidc}
              </a>
              &nbsp;&nbsp;
              <a
                onClick={() => {
                  getRedirectURLCAS().then((res) => {
                    if (res.dat) {
                      window.location.href = res.dat.redirect;
                      localStorage.setItem('CAS_state', res.dat.state);
                    } else {
                      message.warning('没有配置 CAS 登录地址！');
                    }
                  });
                }}
              >
                {displayName.cas}
              </a>
              &nbsp;&nbsp;
              <a
                onClick={() => {
                  getRedirectURLOAuth().then((res) => {
                    if (res.dat) {
                      window.location.href = res.dat;
                    } else {
                      message.warning('没有配置 OAuth 登录地址！');
                    }
                  });
                }}
              >
                {displayName.oauth}
              </a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
