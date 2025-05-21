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
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Form, Input, Button, message, Space, Dropdown, Menu } from 'antd';
import { useLocation } from 'react-router-dom';
import { PictureOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { ifShowCaptcha, getCaptcha, getSsoConfig, getRedirectURL, getRedirectURLCAS, getRedirectURLOAuth, getRedirectURLCustom, authLogin, getRSAConfig } from '@/services/login';
import { RsaEncry } from '@/utils/rsa';
import { CommonStateContext } from '@/App';
import { AccessTokenKey } from '@/utils/constant';

// @ts-ignore
import useSsoWay from 'plus:/parcels/SSOConfigs/useSsoWay';

import { NAME_SPACE } from './constants';
import './locale';
import './login.less';

const i18nMap = {
  zh_CN: '简体',
  zh_HK: '繁體',
  en_US: 'En',
  ja_JP: '日本語',
  ru_RU: 'Русский',
};

export interface DisplayName {
  oidc: string;
  cas: string;
  oauth: string;
  custom?: string;
}

export default function Login() {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const [form] = Form.useForm();
  const location = useLocation();
  const { siteInfo } = useContext(CommonStateContext);
  const redirect = location.search && new URLSearchParams(location.search).get('redirect');
  const [displayName, setDis] = useState<DisplayName>({
    oidc: 'OIDC',
    cas: 'CAS',
    oauth: 'OAuth',
    custom: 'Custom',
  });
  const [showcaptcha, setShowcaptcha] = useState(false);
  const [curLanguage, setCurLanguage] = useState(i18nMap[i18n.language] || '中文');
  const verifyimgRef = useRef<HTMLImageElement>(null);
  const captchaidRef = useRef<string>();
  const refreshCaptcha = () => {
    getCaptcha().then((res) => {
      if (res.dat && verifyimgRef.current) {
        verifyimgRef.current.src = res.dat.imgdata;
        captchaidRef.current = res.dat.captchaid;
      } else {
        message.warning('获取验证码失败');
      }
    });
  };
  useSsoWay();

  useEffect(() => {
    getSsoConfig().then((res) => {
      if (res.dat) {
        setDis({
          oidc: res.dat.oidcDisplayName,
          cas: res.dat.casDisplayName,
          oauth: res.dat.oauthDisplayName,
          custom: res.dat.customDisplayName,
        });
      }
    });

    ifShowCaptcha().then((res) => {
      setShowcaptcha(res?.dat?.show);
      if (res?.dat?.show) {
        getCaptcha().then((res) => {
          if (res.dat && verifyimgRef.current) {
            verifyimgRef.current.src = res.dat.imgdata;
            captchaidRef.current = res.dat.captchaid;
          } else {
            message.warning('获取验证码失败');
          }
        });
      }
    });
  }, []);

  const handleSubmit = () => {
    form.validateFields().then(() => {
      login();
    });
  };

  const login = async () => {
    let { username, password, verifyvalue } = form.getFieldsValue();
    const rsaConf = await getRSAConfig();
    const {
      dat: { OpenRSA, RSAPublicKey },
    } = rsaConf;
    const authPassWord = OpenRSA ? RsaEncry(password, RSAPublicKey) : password;
    authLogin(username, authPassWord, captchaidRef.current!, verifyvalue)
      .then((res) => {
        const { dat, err } = res;
        const { access_token, refresh_token } = dat;
        localStorage.setItem(AccessTokenKey, access_token);
        localStorage.setItem('refresh_token', refresh_token);
        if (!err) {
          window.location.href = redirect || '/';
        }
      })
      .catch(() => {
        if (showcaptcha) {
          refreshCaptcha();
        }
      });
  };

  return (
    <div className='login-warp'>
      <div className='banner integration'>
        <img src={'/image/login-dashboard.svg'} style={{ margin: '0 60px', zIndex: 5, width: 632 }}></img>
      </div>
      <div className='login-panel'>
        <div className='login-main  integration'>
          <div className='login-title'>
            <img src={siteInfo?.login_page_logo_url || '/image/login-logo.png'} style={{ width: '120px' }} />
          </div>
          <Form form={form} layout='vertical' requiredMark={true}>
            <Form.Item
              label={t('username')}
              name='username'
              rules={[
                {
                  required: true,
                  message: t('username_required'),
                },
              ]}
            >
              <Input placeholder={t('username_required')} prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item
              label={t('password')}
              name='password'
              rules={[
                {
                  required: true,
                  message: t('password_required'),
                },
              ]}
            >
              <Input type='password' placeholder={t('password_required')} onPressEnter={handleSubmit} prefix={<LockOutlined />} />
            </Form.Item>

            <div className='text-[14px]'>
              <Form.Item
                label={t('verifyvalue')}
                name='verifyvalue'
                rules={[
                  {
                    required: showcaptcha,
                    message: t('verifyvalue_required'),
                  },
                ]}
                hidden={!showcaptcha}
              >
                <Input placeholder={t('verifyvalue_required')} onPressEnter={handleSubmit} prefix={<PictureOutlined />} />
              </Form.Item>

              <img
                ref={verifyimgRef}
                className='mb2'
                style={{
                  display: showcaptcha ? 'inline-block' : 'none',
                }}
                onClick={refreshCaptcha}
                alt={t('click_get_verify')}
              />
            </div>

            <Form.Item>
              <Button type='primary' onClick={handleSubmit}>
                {t('login')}
              </Button>
            </Form.Item>
            {_.some(displayName, (value) => {
              return !!value;
            }) && (
              <div className='mb1 text-[14px]'>
                <Space align='baseline'>
                  <div>{t('other_types')}:</div>
                  {displayName.oidc && (
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
                  )}
                  {displayName.cas && (
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
                  )}
                  {displayName.oauth && (
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
                  )}
                  {displayName.custom && (
                    <a
                      onClick={() => {
                        getRedirectURLCustom().then((res) => {
                          if (res.dat) {
                            window.location.href = res.dat;
                          } else {
                            message.warning('没有配置 custom 登录地址！');
                          }
                        });
                      }}
                    >
                      {displayName.custom}
                    </a>
                  )}
                </Space>
              </div>
            )}
            <div className='text-[14px]'>
              <Space>
                <div>{t('language')}:</div>
                <Dropdown
                  overlay={
                    <Menu
                      onSelect={({ key }) => {
                        i18n.changeLanguage(key);
                        setCurLanguage(i18nMap[key]);
                        localStorage.setItem('language', key);
                      }}
                      selectable
                    >
                      {Object.keys(i18nMap).map((el) => {
                        return <Menu.Item key={el}>{i18nMap[el]}</Menu.Item>;
                      })}
                    </Menu>
                  }
                >
                  <a onClick={(e) => e.preventDefault()}>{curLanguage}</a>
                </Dropdown>
              </Space>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
