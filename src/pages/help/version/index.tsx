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
import SystemInfoSvg from '@/assets/n9e/image/system-info.svg?react';
import pkgJson from '../../../../package.json';
import './locale';
// @ts-ignore
import LicenseInfo from 'plus:/parcels/LicenseInfo';
// @ts-ignore
import DataSourceInfo from 'plus:/parcels/DataSourceInfo';
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
        <ul className='n9e-border-base' style={{ padding: '20px 30px' }}>
          <li>
            {t('frontend')}：{pkgJson.version}
          </li>
          <li>
            {t('backend')}：{backendVersion}
          </li>
        </ul>
        <div className='n9e-border-base' style={{ padding: '20px' }}>
          <div className='metric-page-title mb-2'>{t('productUpgradeGuide')}</div>
          <ul style={{ padding: '0 20px' }}>
            <li>
              <a href='https://c9xudyniiq.feishu.cn/wiki/UJOxw5bxBiP0gQkywSlcQ4K8n7f'>{t('version') + '(V5.8.13)' + t('upgradeGuide') + '-2025-01'}</a>
            </li>
            <li>
              <a href='https://c9xudyniiq.feishu.cn/wiki/FWklwtELOidixskFoekcHGSHnWg'>{t('version') + '(V5.8.14)' + t('upgradeGuide') + '-2025-02'}</a>
            </li>
            <li>
              <a href='https://c9xudyniiq.feishu.cn/wiki/MrxBwSQiviCDnhkAaJkcg1sRn3e'>{t('version') + '(V5.8.15)' + t('upgradeGuide') + '-2025-03'}</a>
            </li>
            <li>
              <a href='https://c9xudyniiq.feishu.cn/wiki/XN0rwSSvWiyesokCb47cXRKSnxb'>{t('version') + '(V5.8.16)' + t('upgradeGuide') + '-2025-04'}</a>
            </li>
            <li>
              <a href='https://c9xudyniiq.feishu.cn/wiki/CKY4wLt9kiQHmRkQxMwcPPwcnQF'>{t('version') + '(V5.8.17)' + t('upgradeGuide') + '-2025-05'}</a>
            </li>
            <li>
              <a href='https://c9xudyniiq.feishu.cn/wiki/NVwDwveNviAPUkk7QbacdPZpnAb'>{t('version') + '(V5.8.18)' + t('upgradeGuide') + '-2025-07'}</a>
            </li>
          </ul>
        </div>
        <LicenseInfo />
        <DataSourceInfo />
      </div>
    </PageLayout>
  );
}
