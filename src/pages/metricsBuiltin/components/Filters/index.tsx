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
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoCircleOutlined, PlusSquareOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Input, Space, Tooltip, Modal, Empty, message } from 'antd';
import _ from 'lodash';
import classNames from 'classnames';
import { getFilters, deleteFilter } from '../../services';
import FormModal from './FormModal';
import { filtersToStr } from './utils';

export { filtersToStr };

const LOCALE_KEY = 'built-in-metrics-filter-id';

function index(_props: any, ref: any) {
  const { t } = useTranslation('metricsBuiltin');
  const [list, setList] = useState<any[]>([]);
  const [active, setActive] = useState<number>();
  const [search, setSearch] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [formModalProps, setFormModalProps] = useState<any>({
    visible: false,
  });

  useEffect(() => {
    const defaultId = localStorage.getItem(LOCALE_KEY) !== null ? Number(localStorage.getItem(LOCALE_KEY)) : null;
    getFilters().then((res) => {
      setList(res);
      if (!active && defaultId) {
        setActive(defaultId);
      }
    });
  }, [refreshFlag]);

  useImperativeHandle(ref, () => {
    return {
      getActive: () => {
        return _.find(list, { id: active });
      },
    };
  });

  return (
    <>
      <div className='built-in-metrics-filter-header'>
        <div className='built-in-metrics-filter-title'>
          <Space>
            {t('filter.title')}
            <Tooltip title={t('filter.title_tip')}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        </div>
        <PlusSquareOutlined
          onClick={() => {
            setFormModalProps({
              visible: true,
              action: 'add',
            });
          }}
        />
      </div>
      <Input
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      <div className='n9e-metric-views-list-content'>
        {_.isEmpty(list) ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <div style={{ textAlign: 'left' }}>{t('filter.title_tip')}</div>
          </Empty>
        ) : (
          _.map(
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
                    if (item.id === active) {
                      setActive(undefined);
                    } else {
                      setActive(item.id);
                      localStorage.setItem(LOCALE_KEY, item.id);
                    }
                  }}
                >
                  <span className='name'>{item.name}</span>
                  <span>
                    <div className='n9e-metric-views-list-content-item-opes'>
                      <EditOutlined
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            item.configs = JSON.parse(item.configs);
                          } catch (e) {
                            console.error(e);
                          }
                          setFormModalProps({
                            visible: true,
                            action: 'edit',
                            initialValues: item,
                          });
                        }}
                      />
                      <DeleteOutlined
                        onClick={(e) => {
                          e.stopPropagation();
                          Modal.confirm({
                            title: t('common:confirm.delete'),
                            onOk: () => {
                              deleteFilter({
                                ids: [item.id],
                              }).then(() => {
                                message.success(t('common:success.delete'));
                                setRefreshFlag(_.uniqueId('refreshFlag_'));
                              });
                            },
                          });
                        }}
                      />
                    </div>
                  </span>
                </div>
              );
            },
          )
        )}
      </div>
      <FormModal
        {...formModalProps}
        onClose={() => {
          setFormModalProps({
            visible: false,
          });
        }}
        onOk={(record) => {
          if (record) {
            localStorage.setItem(LOCALE_KEY, record.id);
            setActive(record.id);
          }
          setRefreshFlag(_.uniqueId('refreshFlag_'));
        }}
      />
    </>
  );
}

export default forwardRef(index);
