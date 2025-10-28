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
import { Button, Input, Popconfirm, Space, Table, Tag, message } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import AuthorizationWrapper from '@/components/AuthorizationWrapper';
import { CommonStateContext } from '@/App';
import localeCompare from '@/pages/dashboard/Renderer/utils/localeCompare';
import { getESIndexPatterns, deleteESIndexPattern, putESIndexPattern } from './services';
import FormModal from './FormModal';
import { IndexPattern } from './types';
import './locale';
import { SearchOutlined } from '@ant-design/icons';
import EditField from './EditField';

export default function Servers() {
  const { t } = useTranslation('es-index-patterns');
  const { groupedDatasourceList, datasourceList } = useContext(CommonStateContext);
  const [search, setSearch] = useState('');
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
        <div className='border p-4'>
          <AuthorizationWrapper allowedPerms={['/log/index-patterns']} showUnauthorized>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Input
                  prefix={<SearchOutlined />}
                  style={{ width: 300 }}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  placeholder='Search index pattern'
                />
                <Button
                  type='primary'
                  onClick={() => {
                    FormModal({
                      mode: 'create',
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
                className='mt-2'
                size='small'
                rowKey='id'
                tableLayout='fixed'
                loading={loading}
                dataSource={_.filter(data, (item) => _.includes(_.toLower(item.name), _.toLower(search)))}
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
                    sorter: (a, b) => {
                      return localeCompare(_.get(_.find(datasourceList, { id: a.datasource_id }), 'name'), _.get(_.find(datasourceList, { id: b.datasource_id }), 'name'));
                    },
                  },
                  {
                    title: t('name'),
                    dataIndex: 'name',
                    sorter: (a, b) => localeCompare(a.name, b.name),
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
                          <a
                            onClick={() => {
                              if (record) {
                                EditField({
                                  id: record.id,
                                  datasourceList,
                                  onOk(values, name) {
                                    console.log('values', values);
                                    const newFieldConfig = {
                                      ...values,
                                      version: 2,
                                    };
                                    putESIndexPattern(record.id, {
                                      ..._.omit(record, ['fieldConfig', 'id']),
                                      fields_format: JSON.stringify(newFieldConfig),
                                      name,
                                    }).then(() => {
                                      fetchData();
                                      message.success(t('common:success.save'));
                                    });
                                  },
                                });
                              }
                            }}
                          >
                            {t('common:btn.config')}
                          </a>
                          <a
                            onClick={() => {
                              FormModal({
                                mode: 'edit',
                                initialValues: record,
                                indexPatterns: data,
                                datasourceList: groupedDatasourceList.elasticsearch,
                                onOk: () => {
                                  fetchData();
                                },
                              });
                            }}
                          >
                            {t('common:btn.edit')}
                          </a>
                          <Popconfirm
                            title={t('common:confirm.delete')}
                            onConfirm={() => {
                              deleteESIndexPattern(record.id).then(() => {
                                message.success(t('common:success.delete'));
                                fetchData();
                              });
                            }}
                          >
                            <Button type='link' style={{ padding: 0 }} danger>
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
          </AuthorizationWrapper>
        </div>
      </div>
    </PageLayout>
  );
}
