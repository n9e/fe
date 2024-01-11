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
import React, { useState, useEffect, useContext } from 'react';
import { Button, Popconfirm, Space, Table, Tag, message } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import { CommonStateContext } from '@/App';
import { getESIndexPatterns, deleteESIndexPattern } from './services';
import Add from './Add';
import { IndexPattern } from './types';
import './locale';

export { default as Fields } from './Fields';

export default function Servers() {
  const { t } = useTranslation('es-index-patterns');
  const { profile, groupedDatasourceList, datasourceList } = useContext(CommonStateContext);
  const [data, setData] = useState<IndexPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = () => {
    getESIndexPatterns()
      .then((res) => {
        setData(res);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageLayout title={t('title')}>
      <div>
        <div style={{ padding: 10 }}>
          {profile.admin ? (
            <div>
              <div style={{ textAlign: 'right' }}>
                <Button
                  type='primary'
                  onClick={() => {
                    Add({
                      indexPatterns: data,
                      datasourceList: groupedDatasourceList.elasticsearch,
                      onOk: () => {
                        fetchData();
                      },
                    });
                  }}
                >
                  {t('create_btn')}
                </Button>
              </div>
              <Table
                className='mt8'
                size='small'
                rowKey='id'
                tableLayout='fixed'
                loading={loading}
                dataSource={data}
                pagination={false}
                columns={[
                  {
                    title: t('common:datasource.id'),
                    dataIndex: 'datasource_id',
                    render: (val) => {
                      const finded = _.find(datasourceList, { id: val });
                      if (finded) {
                        return <Tag>{finded?.name}</Tag>;
                      }
                      return null;
                    },
                  },
                  {
                    title: t('name'),
                    dataIndex: 'name',
                    render: (val, record) => {
                      return <Link to={`/log/index-patterns/${record.id}`}>{val}</Link>;
                    },
                  },
                  {
                    title: t('time_field'),
                    dataIndex: 'time_field',
                  },
                  {
                    title: t('common:table.operations'),
                    width: 160,
                    render: (record) => {
                      return (
                        <Space>
                          <Link to={`/log/index-patterns/${record.id}`}>{t('common:btn.edit')}</Link>
                          <Popconfirm
                            title={t('common:confirm.delete')}
                            onConfirm={() => {
                              deleteESIndexPattern(record.id).then(() => {
                                message.success(t('common:success.delete'));
                                fetchData();
                              });
                            }}
                          >
                            <Button type='link' style={{ padding: 0 }}>
                              {t('common:btn.delete')}
                            </Button>
                          </Popconfirm>
                        </Space>
                      );
                    },
                  },
                ]}
              />
            </div>
          ) : (
            <div>{t('unauthorized')}</div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
