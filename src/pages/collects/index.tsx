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
import React, { useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import { SettingOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import { BusinessGroup } from '@/pages/targets';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { CommonStateContext } from '@/App';
import List from './List';
import Add from './Add';
import Edit from './Edit';
import './locale';
import './style.less';

export { Add, Edit };

export default function index() {
  const commonState = useContext(CommonStateContext);
  const { t } = useTranslation('collects');
  const { search } = useLocation();
  const history = useHistory();
  const { id } = queryString.parse(search);
  const bgid = id ? Number(id) : commonState.curBusiId;

  return (
    <PageLayout title={t('title')} icon={<SettingOutlined />}>
      <div className='collects-container'>
        <BusinessGroup
          curBusiId={bgid}
          setCurBusiId={(id) => {
            history.push(`/collects?id=${id}`);
            commonState.setCurBusiId(id);
          }}
        />
        {bgid ? <List bgid={bgid} /> : <BlankBusinessPlaceholder text='采集配置' />}
      </div>
    </PageLayout>
  );
}
