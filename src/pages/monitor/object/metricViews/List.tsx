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
import React, { useEffect, useState, useContext } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Input, message, Modal, Tooltip } from 'antd';
import { PlusSquareOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ExportOutlined } from '@ant-design/icons';
import { getList, deleteMetricView } from '@/services/metricViews';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { IMatch } from '../types';
import Form from './Form';
import Export from './Export';
import Collapse from './components/Collapse';

interface IProps {
  datasourceValue: number;
  range: IRawTimeRange;
  onSelect: (item: IMatch) => void;
}

export default function List(props: IProps) {
  const { t } = useTranslation('objectExplorer');
  const [list, setList] = useState<any[]>([]);
  const [active, setActive] = useState<number>();
  const [search, setSearch] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const { profile } = useContext(CommonStateContext);

  useEffect(() => {
    const defaultMetricViewId = localStorage.getItem('metric-view-id') !== null ? Number(localStorage.getItem('metric-view-id')) : null;
    getList().then((res) => {
      setList(res);
      let curId;
      if (!defaultMetricViewId || !_.find(res, { id: defaultMetricViewId })) {
        curId = _.get(_.head(res), 'id');
      } else {
        curId = defaultMetricViewId;
      }
      if (curId) {
        setActive(curId);
        const curItem = _.find(res, { id: curId });
        let configs = {} as IMatch;
        try {
          configs = JSON.parse(curItem.configs);
          configs.id = curId;
          configs.refreshFlag = refreshFlag;
        } catch (e) {
          console.error(e);
        }
        props.onSelect({
          ...configs,
        });
      }
    });
  }, [refreshFlag, props.datasourceValue]);

  return (
    <Collapse collapseLocalStorageKey='quick_view_list_collapse' widthLocalStorageKey='quick_view_list_width' defaultWidth={240} tooltip={t('list.title')}>
      <div className='n9e-metric-views-list'>
        <div className='n9e-metric-views-list-header'>
          <div className='metric-page-title'>{t('list.title')}</div>
          <a>
            <PlusSquareOutlined
              onClick={() => {
                Form({
                  datasourceValue: props.datasourceValue,
                  admin: profile.admin,
                  action: 'add',
                  range: props.range,
                  onOk: (record) => {
                    localStorage.setItem('metric-view-id', record.id);
                    setRefreshFlag(_.uniqueId('refreshFlag_'));
                  },
                });
              }}
            />
          </a>
        </div>
        <Input
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <div className='n9e-metric-views-list-content'>
          {_.isEmpty(list)
            ? 'No Data'
            : _.map(
                _.filter(list, (item) => {
                  if (search) {
                    let result = true;
                    try {
                      const reg = new RegExp(search, 'gi');
                      result = reg.test(item.name);
                    } catch (e) {
                      console.log(e);
                    }
                    return result;
                  }
                  return true;
                }),
                (item) => {
                  return (
                    <div
                      className={classNames({
                        'n9e-metric-views-list-content-item': true,
                        active: item.id === active,
                      })}
                      key={item.id}
                      onClick={() => {
                        setActive(item.id);
                        localStorage.setItem('metric-view-id', item.id);
                        const curItem = _.find(list, { id: item.id });
                        let configs = {} as IMatch;
                        try {
                          configs = JSON.parse(curItem.configs);
                          configs.id = item.id;
                        } catch (e) {
                          console.error(e);
                        }
                        props.onSelect({
                          ...configs,
                        });
                      }}
                    >
                      <span className='name'>{item.name}</span>
                      {item.cate === 1 || profile.admin ? (
                        <span>
                          {item.cate === 0 && (
                            <span className='n9e-metric-views-list-content-item-cate' style={{ color: '#ccc' }}>
                              {t('list.public')}
                            </span>
                          )}
                          <div className='n9e-metric-views-list-content-item-opes'>
                            <EditOutlined
                              onClick={(e) => {
                                e.stopPropagation();
                                let configs = {} as any;
                                try {
                                  configs = JSON.parse(item.configs);
                                  configs.dynamicLabels = _.map(configs.dynamicLabels, 'label');
                                  configs.dimensionLabels = _.map(configs.dimensionLabels, 'label');
                                } catch (e) {
                                  console.error(e);
                                }
                                const initialValues = {
                                  id: item.id,
                                  name: item.name,
                                  cate: item.cate === 0,
                                  ...configs,
                                };
                                Form({
                                  datasourceValue: props.datasourceValue,
                                  admin: profile.admin,
                                  action: 'edit',
                                  range: props.range,
                                  initialValues,
                                  onOk: () => {
                                    localStorage.setItem('metric-view-id', item.id);
                                    setRefreshFlag(_.uniqueId('refreshFlag_'));
                                  },
                                });
                              }}
                            />
                            <DeleteOutlined
                              onClick={(e) => {
                                e.stopPropagation();
                                Modal.confirm({
                                  title: t('common:confirm.delete'),
                                  onOk: () => {
                                    deleteMetricView({
                                      ids: [item.id],
                                    }).then(() => {
                                      message.success(t('common:success.delete'));
                                      setRefreshFlag(_.uniqueId('refreshFlag_'));
                                    });
                                  },
                                });
                              }}
                            />
                            <Tooltip title={t('title.export')} placement='right'>
                              <ExportOutlined
                                onClick={() => {
                                  Export({
                                    data: item.configs,
                                  });
                                }}
                              />
                            </Tooltip>
                          </div>
                        </span>
                      ) : (
                        <span style={{ color: '#ccc' }}>{t('title.public')}</span>
                      )}
                    </div>
                  );
                },
              )}
        </div>
      </div>
    </Collapse>
  );
}
