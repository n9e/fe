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
import { useTranslation } from 'react-i18next';
import Icon from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import SystemInfoSvg from '../../../../public/image/system-info.svg';
import pkgJson from '../../../../package.json';
import './locale';

export default function version() {
  const { t } = useTranslation('version');
  const [backendVersion, setBackendVersion] = useState('');

  useEffect(() => {
    fetch('/api/n9e/version')
      .then((res) => {
        return res.text();
      })
      .then((res) => {
        setBackendVersion(res);
      });
  }, []);

  return (
    <PageLayout
      title={
        <>
          <Icon component={SystemInfoSvg as any} /> {t('title')}
        </>
      }
    >
      <div>
        <ul style={{ padding: '20px 30px' }}>
          <li>
            {t('frontend')}：{pkgJson.version}
          </li>
          <li>
            {t('backend')}：{backendVersion}
          </li>
        </ul>
      </div>
    </PageLayout>
  );
}
