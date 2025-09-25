import React, { useContext, useState, useEffect } from 'react';
import { Space, Select, Input, Button, Table, Tooltip, Tag, Modal, Switch, message } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { EyeOutlined, SearchOutlined, InfoCircleOutlined, WarningFilled, CheckCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDebounceFn } from 'ahooks';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { CommonStateContext } from '@/App';
import { priorityColor } from '@/utils/constant';
import { updateAlertRules, deleteStrategy } from '@/services/warning';
import { allCates } from '@/components/AdvancedWrap/utils';
import RefreshIcon from '@/components/RefreshIcon';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import OrganizeColumns, { getDefaultColumnsConfigs, setDefaultColumnsConfigs, ajustColumns } from '@/components/OrganizeColumns';
import usePagination from '@/components/usePagination';
import Tags from '@/components/Tags';
import localeCompare from '@/pages/dashboard/Renderer/utils/localeCompare';
import { getItems as getNotificationRules, RuleItem as NotificationRuleItem } from '@/pages/notificationRules/services';
import { NS as notificationRulesNS } from '@/pages/notificationRules/constants';
import { AlertRuleType, AlertRuleStatus } from '@/pages/alertRules/types';
import { defaultColumnsConfigs, LOCAL_STORAGE_KEY } from '@/pages/alertRules/List/constants';
import EventsDrawer, { Props as EventsDrawerProps } from '@/pages/alertRules/List/EventsDrawer';

interface Filter {
  cate?: string;
  datasourceIds?: number[];
  search?: string;
  prod?: string;
  severities?: number[];
  disabled?: 0 | 1;
}

const FILTER_LOCAL_STORAGE_KEY = 'alert-rules-filter';
const includesProm = (datasourceList: any[], ids?: number[]) => {
  return _.some(ids, (id) => {
    return _.some(datasourceList, (item) => {
      if (item.id === id) return item.plugin_type === 'prometheus';
    });
  });
};

interface Props {
  hideBusinessGroupColumn?: boolean;
  showRowSelection?: boolean;
  readonly?: boolean;
  headerExtra?: React.ReactElement;
  data: AlertRuleType<any>[];
  loading: boolean;
  setRefreshFlag?: (flag: string) => void;
  linkTarget?: string;
}

export default function AlertRules(props: Props) {
  const { t } = useTranslation('alertRules');
  const { busiGroups, datasourceList } = useContext(CommonStateContext);
  const { hideBusinessGroupColumn, showRowSelection, readonly, headerExtra, data, loading, setRefreshFlag, linkTarget } = props;
  const [filter, setFilter] = useState<Filter>({} as Filter);
  const [queryValue, setQueryValue] = useState<string | undefined>();
  const [selectRowKeys, setSelectRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<AlertRuleType<any>[]>([]);
  const [columnsConfigs, setColumnsConfigs] = useState<{ name: string; visible: boolean }[]>(getDefaultColumnsConfigs(defaultColumnsConfigs, LOCAL_STORAGE_KEY));
  const pagination = usePagination({ PAGESIZE_KEY: 'alert-rules-pagesize' });
  const [eventsDrawerProps, setEventsDrawerProps] = useState<EventsDrawerProps>({
    visible: false,
    onClose: () => {
      setEventsDrawerProps({
        ...eventsDrawerProps,
        visible: false,
      });
    },
  });
  const [notificationRules, setNotificationRules] = useState<NotificationRuleItem[]>();
  const columns: ColumnType<AlertRuleType<any>>[] = _.concat(
    [
      {
        title: (
          <Space>
            {t('table.status')}
            <Tooltip title={t('table.status_tip')}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        ),
        dataIndex: 'cur_event_count',
        sorter: (a, b) => {
          return localeCompare(a.cur_event_count, b.cur_event_count);
        },
        render: (val, record) => {
          return (
            <a
              onClick={() => {
                setEventsDrawerProps({
                  ...eventsDrawerProps,
                  visible: true,
                  title: record.name,
                  rid: record.id,
                });
              }}
              style={{
                fontSize: 20,
                color: val > 0 ? '#e6522c' : '#00a700',
              }}
            >
              {val > 0 ? <WarningFilled /> : <CheckCircleFilled />}
            </a>
          );
        },
      },
    ],
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
        title: t('table.cate'),
        dataIndex: 'cate',
        render: (val) => {
          let logoSrc = _.find(allCates, { value: val })?.logo;
          if (val === 'host') {
            logoSrc = '/image/logos/host.png';
          }
          return <img alt={val} src={logoSrc} height={20} />;
        },
      },
      {
        title: t('table.datasource_ids'),
        dataIndex: 'datasource_ids',
        render(value) {
          if (!value) return '';
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
        title: t('table.name'),
        dataIndex: 'name',
        sorter: (a, b) => {
          return localeCompare(a.name, b.name);
        },
        render: (data, record) => {
          return (
            <Link
              className='table-text'
              to={{
                pathname: `/alert-rules/edit/${record.id}`,
              }}
              target={linkTarget}
            >
              {data}
            </Link>
          );
        },
      },
      {
        title: t('table.severity'),
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
        title: t('table.append_tags'),
        dataIndex: 'append_tags',
        render(value) {
          return (
            <div className='flex flex-wrap gap-[4px] max-w-[400px]'>
              {_.map(value, (item) => {
                return (
                  <Tooltip key={item} title={item}>
                    <Tag color='purple' style={{ maxWidth: '100%', marginRight: 0 }}>
                      <div
                        style={{
                          maxWidth: 'max-content',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item}
                      </div>
                    </Tag>
                  </Tooltip>
                );
              })}
            </div>
          );
        },
      },
      {
        title: t('table.notify_groups_obj'),
        dataIndex: 'notify_groups_obj',
        render: (data) => {
          return (
            <div className='flex flex-wrap gap-[4px] max-w-[400px]'>
              {_.map(data, (user) => {
                const val = user.nickname || user.username || user.name;
                return (
                  <Tooltip key={val} title={val}>
                    <Tag style={{ maxWidth: '100%', marginRight: 0 }}>
                      <div
                        style={{
                          maxWidth: 'max-content',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {val}
                      </div>
                    </Tag>
                  </Tooltip>
                );
              })}
            </div>
          );
        },
      },
      {
        title: t('table.notify_rule_ids'),
        dataIndex: 'notify_rule_ids',
        render: (data) => {
          return (
            <div className='flex flex-wrap gap-[4px] max-w-[400px]'>
              {_.map(data, (id) => {
                const val = _.find(notificationRules, { id })?.name || id;
                return (
                  <Link to={`/${notificationRulesNS}/edit/${id}`} key={val} target='_blank'>
                    <Tooltip title={val}>
                      <Tag style={{ maxWidth: '100%', marginRight: 0 }}>
                        <div
                          style={{
                            maxWidth: 'max-content',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {val}
                        </div>
                      </Tag>
                    </Tooltip>
                  </Link>
                );
              })}
            </div>
          );
        },
      },
      {
        title: t('table.update_at'),
        dataIndex: 'update_at',
        sorter: (a, b) => {
          return a.update_at - b.update_at;
        },
        render: (text: string) => {
          return <div className='table-text'>{moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}</div>;
        },
      },
      {
        title: t('common:table.username'),
        dataIndex: 'update_by',
      },
      {
        title: t('common:table.nickname'),
        dataIndex: 'update_by_nickname',
      },
    ],
    readonly
      ? [
          {
            title: t('table.disabled'),
            dataIndex: 'disabled',
            render: (status) => {
              return (
                <Tag className='mr-0' color={status === AlertRuleStatus.Enable ? 'success' : 'error'}>
                  {status === AlertRuleStatus.Enable ? t('common:enabling') : t('common:disabling')}
                </Tag>
              );
            },
          },
        ]
      : ([
          {
            title: t('table.disabled'),
            dataIndex: 'disabled',
            render: (disabled, record) => (
              <Switch
                checked={disabled === AlertRuleStatus.Enable}
                size='small'
                onChange={() => {
                  const { id, disabled } = record;
                  updateAlertRules(
                    {
                      ids: [id],
                      fields: {
                        disabled: !disabled ? 1 : 0,
                      },
                    },
                    record.group_id,
                  ).then(() => {
                    fetchData();
                  });
                }}
              />
            ),
          },
          {
            title: t('common:table.operations'),
            fixed: 'right',
            render: (record: any) => {
              const anomalyEnabled = _.get(record, ['rule_config', 'anomaly_trigger', 'enable']);
              return (
                <Space>
                  <Link
                    className='table-operator-area-normal'
                    to={{
                      pathname: `/alert-rules/edit/${record.id}?mode=clone`,
                    }}
                    target='_blank'
                  >
                    {t('common:btn.clone')}
                  </Link>
                  <Button
                    size='small'
                    type='link'
                    danger
                    style={{
                      padding: 0,
                    }}
                    onClick={() => {
                      Modal.confirm({
                        title: t('common:confirm.delete'),
                        onOk: () => {
                          deleteStrategy([record.id], record.group_id).then(() => {
                            message.success(t('common:success.delete'));
                            fetchData();
                          });
                        },

                        onCancel() {},
                      });
                    }}
                  >
                    {t('common:btn.delete')}
                  </Button>
                  {record.cate === 'prometheus' && anomalyEnabled === true && (
                    <div>
                      <Link to={{ pathname: `/alert-rules/brain/${record.id}` }}>{t('brain_result_btn')}</Link>
                    </div>
                  )}
                </Space>
              );
            },
          },
        ] as any),
  );
  const { run: searchChange } = useDebounceFn(
    (search) => {
      const newFilter = { ...filter, search };
      setFilter(newFilter);
    },
    {
      wait: 500,
    },
  );
  const filterData = () => {
    return _.filter(data, (item) => {
      const { datasourceIds, search, prod, severities } = filter;
      const datasourceIdsWithoutHost = _.filter(datasourceIds, (id) => id !== -999);
      const lowerCaseQuery = search?.toLowerCase() || '';
      return (
        (item.name.toLowerCase().indexOf(lowerCaseQuery) > -1 || _.join(item.append_tags, ' ').toLowerCase().indexOf(lowerCaseQuery) > -1) &&
        ((prod && prod === item.prod) || !prod) &&
        ((item.severities &&
          _.some(item.severities, (severity) => {
            if (_.isEmpty(severities)) return true;
            return _.includes(severities, severity);
          })) ||
          !item.severities) &&
        (_.some(item.datasource_ids, (id) => {
          if (includesProm(datasourceList, datasourceIdsWithoutHost) && id === 0) return true;
          return _.includes(datasourceIdsWithoutHost, id);
        }) ||
          // 没有选择数据源时显示全部
          datasourceIds?.length === 0 ||
          !datasourceIds ||
          // 如果数据源值包含 host (-999) 则以 prod 判断
          (_.includes(datasourceIds, -999) && item.prod === 'host')) &&
        (filter.disabled === undefined || item.disabled === filter.disabled)
      );
    });
  };
  const fetchData = () => {
    if (setRefreshFlag) {
      setRefreshFlag(_.uniqueId('refresh_'));
    }
  };

  useEffect(() => {
    getNotificationRules().then((res) => {
      setNotificationRules(res);
    });
  }, []);

  return (
    <>
      <div className='flex justify-between flex-wrap gap-[8px]'>
        <Space>
          <RefreshIcon
            onClick={() => {
              fetchData();
            }}
          />
          <DatasourceSelect
            style={{ minWidth: 100 }}
            filterKey='alertRule'
            disableResponsive
            showHost
            value={filter.datasourceIds}
            onChange={(val) => {
              const newFilter = {
                ...filter,
                datasourceIds: val,
              };
              setFilter(newFilter);
              window.sessionStorage.setItem(FILTER_LOCAL_STORAGE_KEY, JSON.stringify(newFilter));
            }}
          />
          <Select
            mode='multiple'
            placeholder={t('severity')}
            style={{ minWidth: 120 }}
            value={filter.severities}
            onChange={(val) => {
              const newFilter = {
                ...filter,
                severities: val,
              };
              setFilter(newFilter);
              window.sessionStorage.setItem(FILTER_LOCAL_STORAGE_KEY, JSON.stringify(newFilter));
            }}
            dropdownMatchSelectWidth={false}
          >
            <Select.Option value={1}>S1（Critical）</Select.Option>
            <Select.Option value={2}>S2（Warning）</Select.Option>
            <Select.Option value={3}>S3（Info）</Select.Option>
          </Select>
          <Input
            placeholder={t('search_placeholder')}
            style={{ width: 200 }}
            value={queryValue}
            onChange={(e) => {
              setQueryValue(e.target.value);
              searchChange(e.target.value);
            }}
            prefix={<SearchOutlined />}
          />
          <Select
            allowClear
            placeholder={t('filter_disabled.placeholder')}
            options={[
              {
                label: t('filter_disabled.0'),
                value: 0,
              },
              {
                label: t('filter_disabled.1'),
                value: 1,
              },
            ]}
            value={filter.disabled}
            onChange={(val) => {
              const newFilter = {
                ...filter,
                disabled: val,
              };
              setFilter(newFilter);
              window.sessionStorage.setItem(FILTER_LOCAL_STORAGE_KEY, JSON.stringify(newFilter));
            }}
          />
        </Space>
        <Space>
          {headerExtra &&
            React.cloneElement(headerExtra, {
              selectRowKeys,
              selectedRows,
              getList: fetchData,
            })}
          <Button
            onClick={() => {
              OrganizeColumns({
                i18nNs: 'alertRules',
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
        showSorterTooltip={false}
        pagination={pagination}
        loading={loading}
        dataSource={filterData()}
        rowSelection={
          showRowSelection
            ? {
                selectedRowKeys: selectedRows.map((item) => item.id),
                onChange: (selectedRowKeys: React.Key[], selectedRows: AlertRuleType<any>[]) => {
                  setSelectRowKeys(selectedRowKeys);
                  setSelectedRows(selectedRows);
                },
              }
            : undefined
        }
        columns={ajustColumns(columns, columnsConfigs)}
      />
      <EventsDrawer {...eventsDrawerProps} />
    </>
  );
}
