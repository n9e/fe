import React, { useState, useContext, useEffect } from 'react';
import { Button, Input, message, Modal, Space, Switch, Tag, Tooltip, Select } from 'antd';
import { ExclamationCircleOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { Link, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { deleteSubscribes, editSubscribe } from '@/services/subscribe';
import { subscribeItem } from '@/store/warningInterface/subscribe';
import RefreshIcon from '@/components/RefreshIcon';
import { CommonStateContext } from '@/App';
import { priorityColor } from '@/utils/constant';
import { DatasourceSelect } from '@/components/DatasourceSelect';
import { strategyStatus } from '@/store/warningInterface';
import Tags from '@/components/TableTags/Tags';
import { allCates, getCateDisplayLabel } from '@/components/AdvancedWrap/utils';
import EnhancedTable from '@/components/EnhancedTable';
import { userColumn } from '@/components/EnhancedTable/columns';
import OrganizeColumns, { getDefaultColumnsConfigs, setDefaultColumnsConfigs, ajustColumns } from '@/components/OrganizeColumns';
import usePagination from '@/components/usePagination';
import { NS as notificationRulesNS } from '@/pages/notificationRules/constants';
import { getItems as getNotificationRules, RuleItem as NotificationRuleItem } from '@/pages/notificationRules/services';

import { defaultColumnsConfigs, LOCAL_STORAGE_KEY } from './constants';
import './locale';
import './index.less';

export { default as Add } from './add';
export { default as Edit } from './edit';

interface Filter {
  query?: string;
  datasourceIds?: number[];
  disabled?: 0 | 1;
}

const FILTER_SESSION_STORAGE_KEY = 'alert-subscribes-filter';

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
  const { t, i18n } = useTranslation('alertSubscribes');
  const history = useHistory();
  const { datasourceList, busiGroups } = useContext(CommonStateContext);
  const { hideBusinessGroupColumn, readonly, headerExtra, data, loading, setRefreshFlag, linkTarget } = props;
  const [columnsConfigs, setColumnsConfigs] = useState<{ name: string; visible: boolean }[]>(getDefaultColumnsConfigs(defaultColumnsConfigs, LOCAL_STORAGE_KEY));
  let defaultFilter = {} as Filter;
  try {
    defaultFilter = JSON.parse(window.sessionStorage.getItem(FILTER_SESSION_STORAGE_KEY) || '{}');
  } catch (e) {
    console.error(e);
  }
  const [query, setQuery] = useState<string>(defaultFilter.query ?? '');
  const [datasourceIds, setDatasourceIds] = useState<number[] | undefined>(defaultFilter.datasourceIds);
  const [filterDisabled, setFilterDisabled] = useState<0 | 1 | undefined>(defaultFilter.disabled);
  const saveFilter = (patch: Partial<Filter>) => {
    const prev = JSON.parse(window.sessionStorage.getItem(FILTER_SESSION_STORAGE_KEY) || '{}');
    window.sessionStorage.setItem(FILTER_SESSION_STORAGE_KEY, JSON.stringify({ ...prev, ...patch }));
  };
  const [notificationRules, setNotificationRules] = useState<NotificationRuleItem[]>();

  const columns: ColumnsType = _.concat(
    [
      {
        title: t('note'),
        dataIndex: 'note',
        render: (data, record: any) => {
          const groupName = _.find(busiGroups, { id: record.group_id })?.name;
          return (
            <div className='flex flex-col gap-0.5'>
              <Link
                to={{
                  pathname: `/alert-subscribes/edit/${record.id}`,
                  state: record,
                }}
                target={linkTarget}
              >
                {data}
              </Link>
              {!hideBusinessGroupColumn && groupName && <span className='text-soft text-xs'>{groupName}</span>}
            </div>
          );
        },
      },
    ] as any,
    [
      {
        title: t('common:datasource.id'),
        dataIndex: 'datasource_ids',
        render(value, record: any) {
          if (!value) return '-';
          const cate = _.find(allCates, { value: record.cate });
          const cateLabel = record.cate === 'host' ? 'Host' : getCateDisplayLabel(cate, i18n.language);
          let logoSrc = cate?.logo;
          if (record.cate === 'host') {
            logoSrc = '/image/logos/host.png';
          }
          return (
            <Space>
              {logoSrc && (
                <Tooltip title={cateLabel}>
                  <img alt={record.cate} src={logoSrc} height={18} />
                </Tooltip>
              )}
              <Tags
                type='outline'
                maxWidth={180}
                data={_.compact(
                  _.map(value, (item) => {
                    if (item === 0) return '$all';
                    const name = _.find(datasourceList, { id: item })?.name;
                    if (!name) return '';
                    return name;
                  }),
                )}
              />
            </Space>
          );
        },
      },
      {
        title: t('severities'),
        dataIndex: 'severities',
        render: (data) => {
          return (
            <Tags
              type='fill'
              borderRadius={6}
              data={_.map(data, (severity) => `S${severity}`)}
              bgColor={(tagname) => {
                const bgColorMap = { S1: 'var(--fc-red-3)', S2: 'var(--fc-orange-3)', S3: 'var(--fc-yellow-3)' };
                return bgColorMap[tagname as string] || 'var(--fc-gray-3)';
              }}
              fontColor={(tagname) => {
                const fontColorMap = { S1: 'var(--fc-red-11)', S2: 'var(--fc-orange-11)', S3: 'var(--fc-yellow-11)' };
                return fontColorMap[tagname as string] || 'var(--fc-gray-11)';
              }}
            />
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
            <Tags
              type='outline'
              maxWidth={180}
              data={_.compact(_.map(text, (tag) => (tag ? `${tag.func} ${_.includes(['in', 'not in'], tag.func) ? tag.value.split(' ').join(', ') : tag.value}` : '')))}
            />
          );
        },
      },
      {
        title: t('tags'),
        dataIndex: 'tags',
        render: (text: any) => {
          return (
            <Tags
              type='outline'
              maxWidth={180}
              data={_.compact(_.map(text, (tag) => (tag ? `${tag.key} ${tag.func} ${_.includes(['in', 'not in'], tag.func) ? tag.value.split(' ').join(', ') : tag.value}` : '')))}
            />
          );
        },
      },
      {
        title: t('user_groups'),
        dataIndex: 'user_groups',
        render: (data) => {
          return <Tags type='outline' maxWidth={180} data={_.map(data, 'name')} />;
        },
      },
      {
        title: t('notify_rule_ids'),
        dataIndex: 'notify_rule_ids',
        render: (data) => {
          return (
            <Tags<number>
              type='outline'
              maxWidth={180}
              data={data}
              getKey={(id) => id}
              getLabel={(id) => _.find(notificationRules, { id })?.name || _.toString(id)}
              onTagClick={(id) => window.open(`/${notificationRulesNS}/edit/${id}`, '_blank')}
            />
          );
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
      userColumn({ title: t('common:table.username'), dataIndex: 'update_by', nickname: 'update_by_nickname' }),
    ],
    readonly
      ? [
          {
            title: t('common:table.enabled'),
            dataIndex: 'disabled',
            sorter: (a, b) => a.disabled - b.disabled,
            filters: [
              { text: t('filter_disabled.0'), value: 0 },
              { text: t('filter_disabled.1'), value: 1 },
            ],
            onFilter: (value, record) => record.disabled === value,
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
            sorter: (a, b) => a.disabled - b.disabled,
            filters: [
              { text: t('filter_disabled.0'), value: 0 },
              { text: t('filter_disabled.1'), value: 1 },
            ],
            onFilter: (value, record) => record.disabled === value,
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
          !datasourceIds) &&
        (filterDisabled === undefined || item.disabled === filterDisabled)
      );
    });
    return res;
  };

  const refreshList = () => {
    setRefreshFlag(_.uniqueId('refresh_'));
  };

  useEffect(() => {
    getNotificationRules().then((res) => {
      setNotificationRules(res);
    });
  }, []);

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
              saveFilter({ datasourceIds: val });
            }}
          />
          <Input
            style={{ minWidth: 400 }}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              saveFilter({ query: e.target.value });
            }}
            prefix={<SearchOutlined />}
            placeholder={t('search_placeholder')}
          />
          <Select
            allowClear
            placeholder={t('filter_disabled.placeholder')}
            options={[
              { label: t('filter_disabled.0'), value: 0 },
              { label: t('filter_disabled.1'), value: 1 },
            ]}
            value={filterDisabled}
            onChange={(val) => {
              setFilterDisabled(val);
              saveFilter({ disabled: val });
            }}
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
      <EnhancedTable
        className='mt-2'
        size='small'
        rowKey='id'
        tableLayout='auto'
        scroll={{ x: 'max-content' }}
        pagination={pagination}
        loading={loading}
        dataSource={filterData()}
        columns={ajustColumns(columns, columnsConfigs)}
        rowActions={
          readonly
            ? undefined
            : (record: subscribeItem) => ({
                menu: [
                  {
                    key: 'edit',
                    icon: 'edit',
                    text: t('common:btn.edit'),
                    onClick: () => history.push({ pathname: `/alert-subscribes/edit/${record.id}` }),
                  },
                  {
                    key: 'clone',
                    icon: 'copy',
                    text: t('common:btn.clone'),
                    onClick: () => history.push({ pathname: `/alert-subscribes/edit/${record.id}`, search: 'mode=clone' }),
                  },
                  {
                    key: 'delete',
                    icon: 'delete',
                    text: t('common:btn.delete'),
                    danger: true,
                    onClick: () => {
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
                    },
                  },
                ],
              })
        }
        actionColumn={{ title: t('common:table.operations'), width: 64 }}
      />
    </>
  );
};

export default Subscribe;
