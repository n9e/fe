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
import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import Explorer from './Explorer';
import './index.less';

const MetricExplorerPage = () => {
  const { t } = useTranslation('explorer');
  const [items, setItems] = React.useState<string[]>([_.uniqueId('item-')]);

  return (
    <PageLayout title={t('title')} icon={<LineChartOutlined />}>
      <div>
        <div className='logs-explorer-container-wrapper'>
          <div className='logs-explorer-container'>
            <Tabs
              size='small'
              type='editable-card'
              onEdit={(targetKey: string, action: 'add' | 'remove') => {
                if (action === 'add') {
                  setItems([...items, _.uniqueId('item-')]);
                } else {
                  setItems(_.filter(items, (item) => item !== targetKey));
                }
              }}
            >
              {_.map(items, (item, idx) => {
                return (
                  <Tabs.TabPane tab={`查询 ${idx + 1}`} key={item}>
                    <Explorer type='logging' defaultCate='elasticsearch' panelIdx={idx} />
                  </Tabs.TabPane>
                );
              })}
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default React.memo(MetricExplorerPage);
