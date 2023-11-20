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
import React, { useState } from 'react';
import { LineChartOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Tabs } from 'antd';
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import Explorer from './Explorer';
import { getuuid, getLocalItems, setLocalItems, getLocalActiveKey, setLocalActiveKey } from './utils';
import './index.less';

const MetricExplorerPage = () => {
  const { t } = useTranslation('explorer');
  const params = queryString.parse(useLocation().search) as { [index: string]: string | null };
  const defaultItems = getLocalItems(params);
  const [items, setItems] = useState<{ key: string; isInited?: boolean; formValues?: any }[]>(defaultItems);
  const [activeKey, setActiveKey] = useState<string>(getLocalActiveKey(params, defaultItems));

  return (
    <PageLayout title={t('title')} icon={<LineChartOutlined />}>
      <div>
        <div className='logs-explorer-container-wrapper'>
          <div className='logs-explorer-container'>
            <Tabs
              size='small'
              type='editable-card'
              activeKey={activeKey}
              onEdit={(targetKey: string, action: 'add' | 'remove') => {
                if (action === 'add') {
                  const newActiveKey = getuuid();
                  const newItems = [
                    ...items,
                    {
                      key: newActiveKey,
                      isInited: false,
                      formValues: {
                        query: {
                          range: {
                            start: 'now-1h',
                            end: 'now',
                          },
                        },
                      },
                    },
                  ];
                  setItems(newItems);
                  setLocalItems(newItems);
                  setActiveKey(newActiveKey);
                  setLocalActiveKey(newActiveKey);
                } else {
                  const newItems = _.filter(items, (item) => item.key !== targetKey);
                  setItems(newItems);
                  setLocalItems(newItems);
                  if (targetKey === activeKey) {
                    setActiveKey(newItems?.[0]?.key);
                    setLocalActiveKey(newItems?.[0]?.key);
                  }
                }
              }}
              onChange={(key) => {
                setActiveKey(key);
                setLocalActiveKey(key);
              }}
            >
              {_.map(items, (item, idx) => {
                return (
                  <Tabs.TabPane closable={items.length !== 1} tab={`${t('query_tab')} ${idx + 1}`} key={item.key}>
                    <Explorer
                      type='logging'
                      defaultCate='elasticsearch'
                      defaultFormValuesControl={{
                        isInited: item.isInited,
                        setIsInited: () => {
                          const newItems = _.map(items, (i) => {
                            if (i.key === item.key) {
                              return {
                                ...i,
                                isInited: true,
                              };
                            }
                            return i;
                          });
                          setItems(newItems);
                        },
                        defaultFormValues: item.formValues,
                        setDefaultFormValues: (newValues) => {
                          const newItems = _.map(items, (i) => {
                            if (i.key === item.key) {
                              return {
                                ...i,
                                isInited: true,
                                formValues: newValues,
                              };
                            }
                            return i;
                          });
                          setLocalItems(newItems);
                          setItems(newItems);
                        },
                      }}
                    />
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
