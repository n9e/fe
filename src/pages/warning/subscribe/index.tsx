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
import { Button, Input, Table, message, Modal, Space, Switch, Tag, Dropdown, Menu } from 'antd';
import { CopyOutlined, ExclamationCircleOutlined, SearchOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { useHistory, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import { getBusiGroupsAlertSubscribes, deleteSubscribes, editSubscribe } from '@/services/subscribe';
import { subscribeItem } from '@/store/warningInterface/subscribe';
import BusinessGroupSideBarWithAll, { getDefaultGids } from '@/components/BusinessGroup/BusinessGroupSideBarWithAll';
import RefreshIcon from '@/components/RefreshIcon';
import { CommonStateContext } from '@/App';
import { priorityColor } from '@/utils/constant';
import { DatasourceSelect } from '@/components/DatasourceSelect';
import { strategyStatus } from '@/store/warningInterface';
import Tags from '@/components/Tags';
import OrganizeColumns, { getDefaultColumnsConfigs, setDefaultColumnsConfigs, ajustColumns } from '@/components/OrganizeColumns';
import { defaultColumnsConfigs, LOCAL_STORAGE_KEY } from './constants';
import { pageSizeOptionsDefault } from '../const';
import './locale';
import './index.less';

export { default as Add } from './add';
export { default as Edit } from './edit';

const QUERY_LOCAL_STORAGE_KEY = 'alertSubscribes_filter_query';
const DATASOURCE_IDS_LOCAL_STORAGE_KEY = 'alertSubscribes_filter_datasource_ids';
const N9E_GIDS_LOCALKEY = 'n9e_subscribes_gids';

const { confirm } = Modal;
const Shield: React.FC = () => {
  const { t } = useTranslation('alertSubscribes');
  const history = useHistory();
  const { datasourceList, businessGroup, busiGroups } = useContext(CommonStateContext);
  const [gids, setGids] = useState<string | undefined>(getDefaultGids(N9E_GIDS_LOCALKEY, businessGroup)); // -2: 所有告警策略
  const [columnsConfigs, setColumnsConfigs] = useState<{ name: string; visible: boolean }[]>(getDefaultColumnsConfigs(defaultColumnsConfigs, LOCAL_STORAGE_KEY));
  const [query, setQuery] = useState<string>(localStorage.getItem(QUERY_LOCAL_STORAGE_KEY) || '');
  const [currentShieldDataAll, setCurrentShieldDataAll] = useState<Array<subscribeItem>>([]);
  const [currentShieldData, setCurrentShieldData] = useState<Array<subscribeItem>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const cacheDefaultDatasourceIds = localStorage.getItem(DATASOURCE_IDS_LOCAL_STORAGE_KEY);
  let defaultDatasourceIds: number[] | undefined = undefined;
  try {
    if (cacheDefaultDatasourceIds) {
      const parsed = JSON.parse(cacheDefaultDatasourceIds);
      if (_.isArray(parsed)) {
        defaultDatasourceIds = parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  const [datasourceIds, setDatasourceIds] = useState<number[] | undefined>(defaultDatasourceIds);
  const columns: ColumnsType = _.concat(
    businessGroup.isLeaf && gids !== '-2'
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
        dataIndex: 'rule_names',
        render: (data) => {
          if (!data) return '-';
          return _.join(data, ', ');
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
        dataIndex: 'operation',
        render: (text: string, record: subscribeItem) => {
          return (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item>
                    <Link
                      to={{
                        pathname: `/alert-subscribes/edit/${record.id}`,
                      }}
                    >
                      {t('common:btn.edit')}
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <Link
                      to={{
                        pathname: `/alert-subscribes/edit/${record.id}`,
                        search: 'mode=clone',
                      }}
                    >
                      {t('common:btn.clone')}
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <Button
                      danger
                      type='link'
                      className='p0 height-auto'
                      onClick={async () => {
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
                    </Button>
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type='link' icon={<MoreOutlined />} />
            </Dropdown>
          );
        },
      },
    ],
  );

  useEffect(() => {
    getList();
  }, [gids]);

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
      const rulesFind = _.find(item?.rule_names, (rule) => {
        return _.includes(rule, query);
      });
      return (
        (item?.note?.indexOf(query) > -1 || !!tagFind || !!groupFind || !!rulesFind) &&
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
    if (gids) {
      setLoading(true);
      const ids = gids === '-2' ? undefined : gids;
      const { success, dat } = await getBusiGroupsAlertSubscribes(ids);
      if (success) {
        setCurrentShieldDataAll(dat || []);
        setLoading(false);
      }
    }
  };

  const refreshList = () => {
    getList();
  };

  return (
    <PageLayout title={t('title')} icon={<CopyOutlined />}>
      <div className='shield-content'>
        <BusinessGroupSideBarWithAll gids={gids} setGids={setGids} localeKey={N9E_GIDS_LOCALKEY} />
        <div
          className='n9e-border-base p2'
          style={{
            width: '100%',
            overflow: 'hidden auto',
          }}
        >
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
                  if (_.isEmpty(val)) {
                    localStorage.removeItem(DATASOURCE_IDS_LOCAL_STORAGE_KEY);
                  } else {
                    localStorage.setItem(DATASOURCE_IDS_LOCAL_STORAGE_KEY, JSON.stringify(val));
                  }
                }}
              />
              <Input
                style={{ minWidth: 400 }}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  localStorage.setItem(QUERY_LOCAL_STORAGE_KEY, e.target.value);
                }}
                prefix={<SearchOutlined />}
                placeholder={t('search_placeholder')}
              />
            </Space>
            <Space>
              {businessGroup.isLeaf && gids !== '-2' && (
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
              <Button
                onClick={() => {
                  OrganizeColumns({
                    i18nNs: 'alertSubscribes',
                    value: columnsConfigs,
                    onChange: (val) => {
                      setColumnsConfigs(val);
                      setDefaultColumnsConfigs(val, LOCAL_STORAGE_KEY);
                    },
                  });
                }}
                icon={<EyeOutlined />}
              />
            </Space>
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
            columns={ajustColumns(columns, columnsConfigs)}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default Shield;
