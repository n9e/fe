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
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { subscribeItem } from '@/store/warningInterface/subscribe';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import { useTranslation } from 'react-i18next';
import { getSubscribeData } from '@/services/subscribe';

import './index.less';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const EditSubscribe: React.FC = () => {
  const { t } = useTranslation('alertSubscribes');
  const [curSubscribeData, setCurSubscribeData] = useState<subscribeItem>();
  const query = useQuery();
  const isClone = query.get('mode');
  const params: any = useParams();
  const shieldId = useMemo(() => {
    return params.id;
  }, [params]);

  useEffect(() => {
    getSubscribe();
  }, [shieldId]);

  const getSubscribe = async () => {
    const { dat } = await getSubscribeData(shieldId);
    const tags = dat.tags.map((item) => {
      return {
        ...item,
        value: item.func === 'in' ? item.value.split(' ') : item.value,
      };
    });
    setCurSubscribeData(
      {
        ...dat,
        datasource_ids: dat.datasource_ids || undefined, // 兼容 null 值
        tags,
      } || {},
    );
  };

  return (
    <PageLayout title={t('title')} showBack>
      {curSubscribeData?.id && <OperateForm detail={curSubscribeData} type={!isClone ? 1 : 2} />}
    </PageLayout>
  );
};

export default EditSubscribe;
