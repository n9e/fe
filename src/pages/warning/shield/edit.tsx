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
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Spin } from 'antd';

import PageLayout from '@/components/pageLayout';
import { getShield } from '@/services/shield';

import OperateForm from './components/operateForm';

import './index.less';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const EditShield: React.FC = () => {
  const { t } = useTranslation('alertMutes');
  const { id } = useParams<{ id: string }>();
  const query = useQuery();
  const isClone = query.get('mode');
  const busiId = query.get('bgid');

  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<any>({});

  useEffect(() => {
    if (busiId && id) {
      setLoading(true);
      getShield(Number(busiId), Number(id))
        .then((res) => {
          const data = res.dat || {};
          // 兼容 <= v6.2.x 版本 loki prod
          if (data.prod === 'loki') {
            data.prod = 'logging';
          }
          setValues(data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [busiId, id]);

  return (
    <PageLayout title={t('title')} showBack doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/alert/alert-mute/'>
      <div className='shield-add'>
        {!_.isEmpty(values) ? (
          <OperateForm detail={values} type={!isClone ? 1 : 2} />
        ) : loading ? (
          <Spin spinning>
            <div className='w-full h-[200px]' />
          </Spin>
        ) : (
          <div>缺少必要参数，无法编辑，请联系管理员</div>
        )}
      </div>
    </PageLayout>
  );
};

export default EditShield;
