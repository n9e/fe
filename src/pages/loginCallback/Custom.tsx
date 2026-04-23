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
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import queryString from 'query-string';
import { Link } from 'react-router-dom';

import { IS_PLUS } from '@/utils/constant';
import { authCallbackCustom } from '@/services/login';
import { AccessTokenKey } from '@/utils/constant';
import { getSsoConfig } from '@/services/login';

export default function Custom() {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    let messageHandler: ((event: MessageEvent) => void) | undefined;

    if (IS_PLUS) {
      getSsoConfig()
        .then((res) => {
          const dat = res.dat;
          console.log('sso way res', dat);
          if (dat.customType === 'liantongyun') {
            // receive token from liantongyun
            messageHandler = (event: MessageEvent) => {
              console.log('event', event);
              if (event.data && event.data.token) {
                // callback to get access_token and refresh_token
                authCallbackCustom({
                  token: event.data.token,
                  redirect: query.redirect || '/',
                })
                  .then((res) => {
                    if (res.err === '') {
                      if (res.dat && res.dat.access_token && res.dat.refresh_token) {
                        localStorage.setItem(AccessTokenKey, res.dat.access_token);
                        localStorage.setItem('refresh_token', res.dat.refresh_token);
                        window.location.href = res.dat.redirect;
                      } else {
                        console.log(res.dat);
                      }
                    } else {
                      setErr(res.err);
                    }
                  })
                  .catch((res) => {
                    setErr(res.message);
                  });
                // send status to liantongyun
                try {
                  if (event.data.linkSource === 'WOCLOUD' && event.source) {
                    event.source.postMessage(
                      {
                        status: 200,
                      },
                      event.origin as unknown as WindowPostMessageOptions,
                    );
                  }
                } catch (e: any) {
                  console.warn(e);
                  setErr(e?.message ?? 'Unknown error');
                }
              } else {
                setErr('不被支持的第三方登录方式');
              }
            };
            window.addEventListener('message', messageHandler);
          } else if (dat.customType === 'dxm') {
            authCallbackCustom({
              ticket: query.ticket,
              redirect: query.redirect || '/',
            })
              .then((res) => {
                if (res.err === '') {
                  if (res.dat && res.dat.access_token && res.dat.refresh_token) {
                    localStorage.setItem(AccessTokenKey, res.dat.access_token);
                    localStorage.setItem('refresh_token', res.dat.refresh_token);
                    window.location.href = res.dat.redirect;
                  } else {
                    console.log(res.dat);
                  }
                } else {
                  setErr(res.err);
                }
              })
              .catch((res) => {
                setErr(res.message);
              });
          } else {
            setErr('不被支持的第三方登录方式');
          }
        })
        .catch((res) => {
          setErr(res.message);
        });
    } else {
      // 非 PLUS 版本不支持，就直接显示错误信息
      setErr('只支持 Plus 版本');
    }

    return () => {
      if (messageHandler) {
        window.removeEventListener('message', messageHandler);
      }
    };
  }, []);

  if (err === undefined)
    return (
      <div className='flex justify-center items-center h-full text-center'>
        <div>
          <h1>第三方登录验证中, 请稍候...</h1>
        </div>
      </div>
    );

  return (
    <div className='flex justify-center items-center h-full text-center'>
      <div>
        <h1>第三方登录验证失败</h1>
        <div className='text-sm'>{err}</div>
        <div>
          <Link to='/login'>返回登录页</Link>
        </div>
      </div>
    </div>
  );
}
