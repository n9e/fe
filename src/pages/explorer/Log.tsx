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
import { LineChartOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import AdvancedWrap from '@/components/AdvancedWrap';
import Explorer from './Explorer';
import './index.less';

const MetricExplorerPage = () => {
  const { t } = useTranslation('explorer');
  return (
    <PageLayout title={t('title')} icon={<LineChartOutlined />}>
      <div className='prometheus-page'>
        <AdvancedWrap
          var='VITE_IS_SLS_DS'
          children={(isShow) => {
            const cateOptions = isShow[0]
              ? [
                  {
                    label: 'Elasticsearch',
                    value: 'elasticsearch',
                  },
                  {
                    label: '阿里云SLS',
                    value: 'aliyun-sls',
                  },
                ]
              : [
                  {
                    label: 'Elasticsearch',
                    value: 'elasticsearch',
                  },
                ];
            return <Explorer cateOptions={cateOptions} type='log' defaultCate='elasticsearch' />;
          }}
        />
      </div>
    </PageLayout>
  );
};

export default MetricExplorerPage;
