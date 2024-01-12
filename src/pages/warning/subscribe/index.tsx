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
import { Button, Input, Table, message, Modal, Space, Switch, Tag } from 'antd';
import { CopyOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { useHistory, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import { getBusiGroupsAlertSubscribes, deleteSubscribes, editSubscribe } from '@/services/subscribe';
import { subscribeItem } from '@/store/warningInterface/subscribe';
import BusinessGroup from '@/components/BusinessGroup';
import RefreshIcon from '@/components/RefreshIcon';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { CommonStateContext } from '@/App';
import { priorityColor } from '@/utils/constant';
import { DatasourceSelect } from '@/components/DatasourceSelect';
import { strategyStatus } from '@/store/warningInterface';
import Tags from '@/components/Tags';
import { pageSizeOptionsDefault } from '../const';
import './locale';
import './index.less';

export { default as Add } from './add';
export { default as Edit } from './edit';

const { confirm } = Modal;
const Shield: React.FC = () => {
  const { t } = useTranslation('alertSubscribes');
  const history = useHistory();
  const { datasourceList, businessGroup, busiGroups } = useContext(CommonStateContext);
  const [query, setQuery] = useState<string>('');
  const [currentShieldDataAll, setCurrentShieldDataAll] = useState<Array<subscribeItem>>([]);
  const [currentShieldData, setCurrentShieldData] = useState<Array<subscribeItem>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [datasourceIds, setDatasourceIds] = useState<number[]>();
  const columns: ColumnsType = _.concat(
    businessGroup.isLeaf
      ? []
      : ([
          {
            title: t('common:business_group'),
            dataIndex: 'group_id',
            width: 100,
            render: (id) => {
              return _.find(busiGroups, { id })?.name;
            },
          },
        ] as any),
    [
      {
        title: t('note'),
        dataIndex: 'note',
        render: (data, record: any) => {
          return (
            <Link
              to={{
                pathname: `/alert-subscribes/edit/${record.id}`,
                state: record,
              }}
            >
              {data}
            </Link>
          );
        },
      },
      {
        title: t('common:datasource.id'),
        dataIndex: 'datasource_ids',
        width: 100,
        render(value) {
          if (!value) return '-';
          return (
            <Tags
              width={70}
              data={_.compact(
                _.map(value, (item) => {
                  if (item === 0) return '$all';
                  const name = _.find(datasourceList, { id: item })?.name;
                  if (!name) return '';
                  return name;
                }),
              )}
            />
          );
        },
      },
      {
        title: t('severities'),
        dataIndex: 'severities',
        render: (data) => {
          return (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
              }}
            >
              {_.map(data, (severity) => {
                return (
                  <Tag
                    key={severity}
                    color={priorityColor[severity - 1]}
                    style={{
                      marginRight: 0,
                    }}
                  >
                    S{severity}
                  </Tag>
                );
              })}
            </div>
          );
        },
      },
      {
        title: t('rule_name'),
        dataIndex: 'rule_name',
        render: (data) => {
          if (!data) return '-';
          return <div>{data}</div>;
        },
      },
      {
        title: t('group.key.label'),
        dataIndex: 'busi_groups',
        render: (text: any) => {
          if (!text) return '-';
          return (
            <>
              {text
                ? text.map((tag, index) => {
                    return tag ? <div key={index}>{`${tag.key} ${tag.func} ${tag.func === 'in' ? tag.value.split(' ').join(', ') : tag.value}`}</div> : null;
                  })
                : ''}
            </>
          );
        },
      },
      {
        title: t('tags'),
        dataIndex: 'tags',
        render: (text: any) => {
          return (
            <>
              {text
                ? text.map((tag, index) => {
                    return tag ? <div key={index}>{`${tag.key} ${tag.func} ${tag.func === 'in' ? tag.value.split(' ').join(', ') : tag.value}`}</div> : null;
                  })
                : ''}
            </>
          );
        },
      },
      {
        title: t('user_groups'),
        dataIndex: 'user_groups',
        width: 140,
        render: (data) => {
          return <Tags width={110} data={_.map(data, 'name')} />;
        },
      },
      {
        title: t('redefine_severity'),
        dataIndex: 'new_severity',
        render: (text: number, record: subscribeItem) => {
          if (record.redefine_severity === 1) {
            return (
              <Tag key={text} color={priorityColor[text - 1]}>
                S{text}
              </Tag>
            );
          }
          return '-';
        },
      },
      {
        title: t('common:table.create_by'),
        ellipsis: true,
        dataIndex: 'update_by',
      },
      {
        title: t('common:table.enabled'),
        dataIndex: 'disabled',
        width: 70,
        render: (disabled, record: any) => (
          <Switch
            checked={disabled === strategyStatus.Enable}
            size='small'
            onChange={() => {
              editSubscribe(
                [
                  {
                    ..._.omit(record, ['create_at', 'create_by', 'update_at', 'update_by']),
                    disabled: disabled === 0 ? 1 : 0,
                  },
                ],
                record.group_id,
              ).then(() => {
                refreshList();
              });
            }}
          />
        ),
      },
      {
        title: t('common:table.operations'),
        width: 140,
        dataIndex: 'operation',
        render: (text: undefined, record: subscribeItem) => {
          return (
            <>
              <Space>
                <Link
                  to={{
                    pathname: `/alert-subscribes/edit/${record.id}`,
                  }}
                >
                  {t('common:btn.edit')}
                </Link>
                <div
                  className='table-operator-area-normal'
                  style={{
                    cursor: 'pointer',
                    display: 'inline-block',
                  }}
                  onClick={() => {
                    history.push(`/alert-subscribes/edit/${record.id}?mode=clone`);
                  }}
                >
                  {t('common:btn.clone')}
                </div>
                <div
                  className='table-operator-area-warning'
                  onClick={() => {
                    confirm({
                      title: t('common:confirm.delete'),
                      icon: <ExclamationCircleOutlined />,
                      onOk: () => {
                        deleteSubscribes({ ids: [record.id] }, record.group_id).then((res) => {
                          refreshList();
                          if (res.err) {
                            message.success(res.err);
                          } else {
                            message.success(t('common:success.delete'));
                          }
                        });
                      },

                      onCancel() {},
                    });
                  }}
                >
                  {t('common:btn.delete')}
                </div>
              </Space>
            </>
          );
        },
      },
    ],
  );

  useEffect(() => {
    getList();
  }, [businessGroup.ids]);

  useEffect(() => {
    filterData();
  }, [query, datasourceIds, currentShieldDataAll]);

  const filterData = () => {
    const data = JSON.parse(JSON.stringify(currentShieldDataAll));
    const res = data.filter((item: subscribeItem) => {
      const tagFind = item?.tags?.find((tag) => {
        return tag.key.indexOf(query) > -1 || tag.value.indexOf(query) > -1 || tag.func.indexOf(query) > -1;
      });
      const groupFind = item?.user_groups?.find((item) => {
        return item?.name?.indexOf(query) > -1;
      });
      return (
        (item?.rule_name?.indexOf(query) > -1 || item?.note?.indexOf(query) > -1 || !!tagFind || !!groupFind) &&
        (_.some(item.datasource_ids, (id) => {
          if (id === 0) return true;
          return _.includes(datasourceIds, id);
        }) ||
          datasourceIds?.length === 0 ||
          !datasourceIds)
      );
    });
    setCurrentShieldData(res || []);
  };

  const getList = async () => {
    if (businessGroup.ids) {
      setLoading(true);
      const { success, dat } = await getBusiGroupsAlertSubscribes(businessGroup.ids);
      if (success) {
        setCurrentShieldDataAll(dat || []);
        setLoading(false);
      }
    }
  };

  const refreshList = () => {
    getList();
  };

  const onSearchQuery = (e) => {
    let val = e.target.value;
    setQuery(val);
  };

  return (
    <PageLayout title={t('title')} icon={<CopyOutlined />}>
      <div className='shield-content'>
        <BusinessGroup />
        {businessGroup.ids ? (
          <div style={{ padding: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Space>
                <RefreshIcon
                  onClick={() => {
                    refreshList();
                  }}
                />
                <DatasourceSelect
                  style={{ width: 100 }}
                  filterKey='alertRule'
                  value={datasourceIds}
                  onChange={(val) => {
                    setDatasourceIds(val);
                  }}
                />
                <Input style={{ minWidth: 400 }} onPressEnter={onSearchQuery} prefix={<SearchOutlined />} placeholder={t('search_placeholder')} />
              </Space>
              {businessGroup.isLeaf && (
                <div>
                  <Button
                    type='primary'
                    className='add'
                    onClick={() => {
                      history.push('/alert-subscribes/add');
                    }}
                  >
                    {t('common:btn.add')}
                  </Button>
                </div>
              )}
            </div>
            <Table
              className='mt8'
              size='small'
              rowKey='id'
              pagination={{
                total: currentShieldData.length,
                showQuickJumper: true,
                showSizeChanger: true,
                showTotal: (total) => {
                  return t('common:table.total', { total });
                },
                pageSizeOptions: pageSizeOptionsDefault,
                defaultPageSize: 30,
              }}
              loading={loading}
              dataSource={currentShieldData}
              columns={columns}
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text={t('title')} />
        )}
      </div>
    </PageLayout>
  );
};

export default Shield;
