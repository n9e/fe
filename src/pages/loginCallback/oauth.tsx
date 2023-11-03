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
import { authCallbackOAuth } from '@/services/login';
import { AccessTokenKey } from '@/utils/constant';

export default function index() {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const [err, setErr] = useState();

  useEffect(() => {
    authCallbackOAuth({
      code: query.code,
      state: query.state,
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
  }, []);
  if (err === undefined) return null;
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        textAlign: 'center',
      }}
    >
      <div>
        <h1>第三方登录验证失败</h1>
        <div style={{ fontSize: 14 }}>{err}</div>
        <div>
          <a href='/login'>返回登录页</a>
        </div>
      </div>
    </div>
  );
}
