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
import { SettingOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import BusinessGroupSideBarWithAll, { getDefaultGids } from '@/components/BusinessGroup/BusinessGroupSideBarWithAll';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { CommonStateContext } from '@/App';
import List from './List';
import Add from './Add';
import Edit from './Edit';
import './locale';
import './style.less';

export { Add, Edit };

const N9E_GIDS_LOCALKEY = 'N9E_ALERT_NODE_ID';

export default function index() {
  const { businessGroup } = useContext(CommonStateContext);
  const { t } = useTranslation('alertRules');
  const [gids, setGids] = useState<string | undefined>(getDefaultGids(N9E_GIDS_LOCALKEY, businessGroup));

  return (
    <PageLayout title={t('title')} icon={<SettingOutlined />}>
      <div className='alert-rules-container'>
        <BusinessGroupSideBarWithAll gids={gids} setGids={setGids} localeKey={N9E_GIDS_LOCALKEY} />
        {businessGroup.ids ? <List gids={gids} /> : <BlankBusinessPlaceholder text={t('title')} />}
      </div>
    </PageLayout>
  );
}
