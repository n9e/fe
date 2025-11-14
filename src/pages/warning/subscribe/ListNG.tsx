import React, { useState, useContext } from 'react';
import { Button, Input, Table, message, Modal, Space, Switch, Tag, Dropdown, Menu } from 'antd';
import { ExclamationCircleOutlined, SearchOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { deleteSubscribes, editSubscribe } from '@/services/subscribe';
import { subscribeItem } from '@/store/warningInterface/subscribe';
import RefreshIcon from '@/components/RefreshIcon';
import { CommonStateContext } from '@/App';
import { priorityColor } from '@/utils/constant';
import { DatasourceSelect } from '@/components/DatasourceSelect';
import { strategyStatus } from '@/store/warningInterface';
import Tags from '@/components/Tags';
import OrganizeColumns, { getDefaultColumnsConfigs, setDefaultColumnsConfigs, ajustColumns } from '@/components/OrganizeColumns';
import usePagination from '@/components/usePagination';

import { defaultColumnsConfigs, LOCAL_STORAGE_KEY } from './constants';
import './locale';
import './index.less';

export { default as Add } from './add';
export { default as Edit } from './edit';

const QUERY_LOCAL_STORAGE_KEY = 'alertSubscribes_filter_query';
const DATASOURCE_IDS_LOCAL_STORAGE_KEY = 'alertSubscribes_filter_datasource_ids';

const { confirm } = Modal;

interface Props {
  hideBusinessGroupColumn?: boolean;
  readonly?: boolean;
  headerExtra?: React.ReactNode;
  data: subscribeItem[];
  loading: boolean;
  setRefreshFlag: (flag: string) => void;
  linkTarget?: string;
}

const Subscribe = (props: Props) => {
  const { t } = useTranslation('alertSubscribes');
  const { datasourceList, busiGroups } = useContext(CommonStateContext);
  const { hideBusinessGroupColumn, readonly, headerExtra, data, loading, setRefreshFlag, linkTarget } = props;
  const [columnsConfigs, setColumnsConfigs] = useState<{ name: string; visible: boolean }[]>(getDefaultColumnsConfigs(defaultColumnsConfigs, LOCAL_STORAGE_KEY));
  const [query, setQuery] = useState<string>(localStorage.getItem(QUERY_LOCAL_STORAGE_KEY) || '');
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
    hideBusinessGroupColumn
      ? []
      : ([
          {
            title: t('common:business_group'),
            dataIndex: 'group_id',
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
              target={linkTarget}
            >
              {data}
            </Link>
          );
        },
      },
      {
        title: t('common:datasource.id'),
        dataIndex: 'datasource_ids',
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
                    return tag ? <div key={index}>{`${tag.func} ${_.includes(['in', 'not in'], tag.func) ? tag.value.split(' ').join(', ') : tag.value}`}</div> : null;
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
                    return tag ? <div key={index}>{`${tag.key} ${tag.func} ${_.includes(['in', 'not in'], tag.func) ? tag.value.split(' ').join(', ') : tag.value}`}</div> : null;
                  })
                : ''}
            </>
          );
        },
      },
      {
        title: t('user_groups'),
        dataIndex: 'user_groups',
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
    ],
    readonly
      ? [
          {
            title: t('common:table.enabled'),
            dataIndex: 'disabled',
            render: (status) => {
              return (
                <Tag className='mr-0' color={status === strategyStatus.Enable ? 'success' : 'error'}>
                  {status === strategyStatus.Enable ? t('common:enabling') : t('common:disabling')}
                </Tag>
              );
            },
          },
        ]
      : [
          {
            title: t('common:table.enabled'),
            dataIndex: 'disabled',
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
            fixed: 'right',
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
                          className='p-0 h-auto'
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
  const pagination = usePagination({ pageSizeLocalstorageKey: 'alert-subscribes-table-pagesize', defaultPageSize: 30, pageSizeOptions: ['30', '50', '100', '300'] });

  const filterData = () => {
    const res = _.filter(data, (item: subscribeItem) => {
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
    return res;
  };

  const refreshList = () => {
    setRefreshFlag(_.uniqueId('refresh_'));
  };

  return (
    <>
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
          {headerExtra}
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
        className='mt-2'
        size='small'
        rowKey='id'
        tableLayout='auto'
        scroll={{ x: 'max-content' }}
        pagination={pagination}
        loading={loading}
        dataSource={filterData()}
        columns={ajustColumns(columns, columnsConfigs)}
      />
    </>
  );
};

export default Subscribe;
