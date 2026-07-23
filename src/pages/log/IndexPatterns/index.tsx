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
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Button, Input, Modal, Tag, message } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import PageLayout from '@/components/pageLayout';
import EnhancedTable from '@/components/EnhancedTable';
import AuthorizationWrapper from '@/components/AuthorizationWrapper';
import { CommonStateContext } from '@/App';
import { getESIndexPatterns, deleteESIndexPattern, putESIndexPattern, putESIndexPatternWeights } from './services';
import FormModal from './FormModal';
import { IndexPattern } from './types';
import './locale';
import { MenuOutlined, SearchOutlined } from '@ant-design/icons';
import EditField from './EditField';
import { useQuery } from '@/utils';
import './style.less';

const DragHandle = SortableHandle((props: { disabled?: boolean }) => {
  return <Button type='text' size='small' icon={<MenuOutlined />} className='index-pattern-row-drag-handle' disabled={props.disabled} />;
});

const SortableBody = SortableContainer((props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />);
const SortableRow = SortableElement((props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />);

export default function Servers() {
  const { t } = useTranslation('es-index-patterns');
  const { groupedDatasourceList, datasourceList } = useContext(CommonStateContext);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<IndexPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const query = useQuery();
  const indexPatternId = query.get('indexPatternId');
  const fetchData = (init?: boolean) => {
    setLoading(true);
    return getESIndexPatterns()
      .then((res) => {
        setData(res);
        if (init && indexPatternId) {
          const indexPattern = _.find(res, { id: Number(indexPatternId) });
          if (indexPattern) {
            EditField({
              id: indexPattern.id,
              datasourceList,
              onOk(values, name) {
                const newFieldConfig = {
                  ...values,
                  version: 2,
                };
                putESIndexPattern(indexPattern.id, {
                  ..._.omit(indexPattern, ['fieldConfig', 'id']),
                  fields_format: JSON.stringify(newFieldConfig),
                  name,
                }).then(() => {
                  fetchData();
                  message.success(t('common:success.save'));
                });
              },
            });
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const filteredData = useMemo(() => {
    return _.filter(data, (item) => _.includes(_.toLower(item.name), _.toLower(search)));
  }, [data, search]);

  const DraggableBodyRow = (props: React.HTMLAttributes<HTMLTableRowElement>) => {
    const rowKey = (props as any)['data-row-key'] as number | string | undefined;
    const index = _.findIndex(filteredData, (item) => String(item.id) === String(rowKey));
    if (index < 0) {
      return <tr {...props} />;
    }
    return <SortableRow index={index} {...props} />;
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  return (
    <PageLayout title={t('title')}>
      <div>
        <div className='fc-border rounded-lg p-4'>
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
              <EnhancedTable
                className='mt-2'
                size='small'
                rowKey='id'
                tableLayout='fixed'
                loading={loading}
                dataSource={filteredData}
                pagination={false}
                actionColumn={{ title: t('common:table.operations'), width: 100, fixed: false }}
                rowActions={(record) => ({
                  inline: [
                    {
                      key: 'config',
                      text: t('common:btn.config'),
                      onClick: () => {
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
                      },
                    },
                    {
                      key: 'edit',
                      icon: 'edit',
                      text: t('common:btn.edit'),
                      onClick: () => {
                        FormModal({
                          mode: 'edit',
                          initialValues: record,
                          indexPatterns: data,
                          datasourceList: groupedDatasourceList.elasticsearch,
                          onOk: () => {
                            fetchData();
                          },
                        });
                      },
                    },
                    {
                      key: 'delete',
                      icon: 'delete',
                      danger: true,
                      text: t('common:btn.delete'),
                      onClick: () => {
                        Modal.confirm({
                          title: t('common:confirm.delete'),
                          onOk: () => {
                            deleteESIndexPattern(record.id).then(() => {
                              message.success(t('common:success.delete'));
                              fetchData();
                            });
                          },
                        });
                      },
                    },
                  ],
                })}
                columns={[
                  {
                    title: '',
                    dataIndex: '__sort',
                    width: 40,
                    className: 'index-pattern-sort-col',
                    render: () => {
                      return <DragHandle disabled={saving} />;
                    },
                  },
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
                  },
                  {
                    title: t('time_field'),
                    dataIndex: 'time_field',
                  },
                ]}
                components={{
                  body: {
                    wrapper: (props: React.HTMLAttributes<HTMLTableSectionElement>) => {
                      return (
                        <SortableBody
                          useDragHandle
                          helperClass='index-pattern-row-dragging'
                          hideSortableGhost
                          onSortEnd={async ({ oldIndex, newIndex }) => {
                            if (saving || oldIndex === newIndex) return;

                            const oldData = data;
                            const movedVisibleData = arrayMoveImmutable(filteredData, oldIndex, newIndex);
                            const visibleIds = new Set(_.map(filteredData, 'id'));
                            let visibleIndex = 0;
                            const newData = _.map(data, (item) => {
                              if (!visibleIds.has(item.id)) {
                                return item;
                              }
                              return movedVisibleData[visibleIndex++];
                            }).map((item, idx) => ({
                              ...item,
                              weight: idx,
                            }));

                            setData(newData);
                            setSaving(true);
                            try {
                              await putESIndexPatternWeights(
                                newData.map((item, idx) => ({
                                  id: item.id,
                                  weight: idx,
                                })),
                              );
                              message.success(t('common:success.save'));
                              fetchData();
                            } catch (e) {
                              setData(oldData);
                              message.error(t('common:error.save'));
                            } finally {
                              setSaving(false);
                            }
                          }}
                          {...props}
                        />
                      );
                    },
                    row: DraggableBodyRow,
                  },
                }}
              />
            </div>
          </AuthorizationWrapper>
        </div>
      </div>
    </PageLayout>
  );
}
