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
import { useHistory } from 'react-router-dom';
import { RollbackOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';

import PageLayout from '@/components/pageLayout';
import { CommonStateContext } from '@/App';

import ResultContent from './ResultContent';

const index = (props: any) => {
  const history = useHistory();
  const { businessGroup } = useContext(CommonStateContext);
  const query = queryString.parse(props.location?.search);
  // 优先用列表页传来的 gid，避免「全部任务」(-2) 视图下取当前选中组导致越权/定位错误
  const curBusiId = Number(query.gid) || businessGroup.id!;
  const { params } = props.match;
  const taskId = params.id;
  const { t } = useTranslation('common');

  return (
    <PageLayout
      title={
        <>
          <RollbackOutlined className='back' onClick={() => history.push('/job-tasks')} />
          {t('task')}
        </>
      }
    >
      <ResultContent taskId={taskId} busiId={curBusiId} />
    </PageLayout>
  );
};

export default index;
