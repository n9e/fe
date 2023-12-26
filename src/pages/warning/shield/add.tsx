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
import _ from 'lodash';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { CommonStateContext } from '@/App';
import OperateForm from './components/operateForm';
import './index.less';

const AddShield: React.FC = () => {
  const { t } = useTranslation('alertMutes');
  const { search } = useLocation();
  const { businessGroup } = useContext(CommonStateContext);
  const curBusiId = businessGroup.id!;
  const query: any = queryString.parse(search);

  if (query.busiGroup) {
    query.group_id = _.toNumber(query.busiGroup);
  } else {
    query.group_id = curBusiId;
  }
  if (query.datasource_ids) {
    if (_.isString(query.datasource_ids)) {
      query.datasource_ids = [_.toNumber(query.datasource_ids)];
    } else if (_.isArray(query.datasource_ids)) {
      query.datasource_ids = query.datasource_ids.map((id: string) => _.toNumber(id));
    } else {
      query.datasource_ids = [];
    }
  }
  if (query.tags) {
    try {
      if (_.isString(query.tags)) {
        query.tags = [query.tags];
      }
      query.tags = query.tags.map((tag) => {
        const [key, value] = tag.split('=');
        return {
          func: '==',
          key,
          value,
        };
      });
    } catch (e) {
      query.tags = [];
    }
  }

  return (
    <PageLayout title={t('title')} showBack>
      <div className='shield-add'>
        <OperateForm detail={query} />
      </div>
    </PageLayout>
  );
};

export default AddShield;
