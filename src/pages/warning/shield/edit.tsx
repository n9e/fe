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
import { useLocation } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import { useTranslation } from 'react-i18next';
import './index.less';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const EditShield: React.FC = () => {
  const { t } = useTranslation('alertMutes');
  const { state } = useLocation<any>();
  const query = useQuery();
  const isClone = query.get('mode');

  // 兼容 <= v6.2.x 版本 loki prod
  if (state.prod === 'loki') {
    state.prod = 'logging';
  }

  return (
    <PageLayout title={t('title')} showBack>
      <div className='shield-add'>{state.id && <OperateForm detail={state} type={!isClone ? 1 : 2} />}</div>
    </PageLayout>
  );
};

export default EditShield;
