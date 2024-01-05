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
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { SettingOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import BusinessGroup, { getCleanBusinessGroupIds } from '@/components/BusinessGroup';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { CommonStateContext } from '@/App';
import List from './List';
import Add from './Add';
import Edit from './Edit';
import './locale';
import './style.less';

export { Add, Edit };

const N9E_ALERT_NODE_ID = 'N9E_ALERT_NODE_ID';

export default function index() {
  const { businessGroup } = useContext(CommonStateContext);
  const { t } = useTranslation('alertRules');
  const [gids, setGids] = useState<string | undefined>(localStorage.getItem(N9E_ALERT_NODE_ID) || businessGroup.ids); // -2: 所有告警策略

  return (
    <PageLayout title={t('title')} icon={<SettingOutlined />}>
      <div className='alert-rules-container'>
        <BusinessGroup
          renderHeadExtra={() => {
            return (
              <div>
                <div className='left-area-group-title'>{t('default_filter.title')}</div>
                <div
                  className={classNames({
                    'n9e-biz-group-item': true,
                    active: gids === '-2',
                  })}
                  onClick={() => {
                    setGids('-2');
                    localStorage.setItem(N9E_ALERT_NODE_ID, '-2');
                  }}
                >
                  {t('default_filter.all')}
                </div>
              </div>
            );
          }}
          showSelected={gids !== '-2'}
          onSelect={(key) => {
            const ids = getCleanBusinessGroupIds(key);
            setGids(ids);
            localStorage.removeItem(N9E_ALERT_NODE_ID);
          }}
        />
        {businessGroup.ids ? <List gids={gids === '-2' ? undefined : gids} /> : <BlankBusinessPlaceholder text={t('title')} />}
      </div>
    </PageLayout>
  );
}
