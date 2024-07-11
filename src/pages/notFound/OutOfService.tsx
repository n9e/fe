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
import React from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { basePrefix } from '@/App';
import './locale';

const OutOfService: React.FC = () => {
  const { t } = useTranslation('notFound');
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
      <h3 style={{ fontSize: 40, color: '#888' }}>
        {import.meta.env.VITE_IS_ENT ? 'Flashcat' : 'Nightingale'} <span>{t('网络开小差了')}</span>
      </h3>
      <h6 style={{ fontSize: 32, color: '#999', display: 'flex', alignItems: 'center' }}>
        {t('可以刷新一下试试')}{' '}
        <Button
          type='primary'
          style={{ marginLeft: 16 }}
          onClick={() => {
            location.href = basePrefix || '/';
          }}
        >
          {t('刷新')}
        </Button>
      </h6>
      <img src='/image/out-of-service.png' />
    </div>
  );
};

export default OutOfService;
