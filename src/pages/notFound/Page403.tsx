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
import { Button, Result } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import { getUserInfoList } from '@/services/manage';
import { User } from '@/store/manageInterface';

type UserWithRoles = User & {
  roles?: string[];
};

const NotFound: React.FC = () => {
  const { t } = useTranslation('common');
  const history = useHistory();
  const [admins, setAdmins] = useState<string[]>([]);

  useEffect(() => {
    getUserInfoList({ limit: 5000 })
      .then((res) => {
        const list = (res?.dat?.list || []) as UserWithRoles[];
        const adminNames = list
          .filter((item) => item.roles?.includes('Admin'))
          .map((item) => item.nickname || item.username)
          .filter(Boolean);

        setAdmins(adminNames);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Result
        title='403'
        subTitle={
          <>
            <div>{t('auth.403')}</div>
            {admins.length > 0 && (
              <div style={{ marginTop: 8, color: 'rgba(0, 0, 0, 0.45)', lineHeight: '24px' }}>
                {t('auth.403_admin')}
                {admins.join(', ')}
              </div>
            )}
          </>
        }
        extra={
          <Button
            type='primary'
            onClick={() => {
              window.history.length > 1 ? history.goBack() : history.replace('/');
            }}
          >
            {t('auth.403_back')}
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
