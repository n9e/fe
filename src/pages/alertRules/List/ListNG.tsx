import React, { useContext, useState, useEffect } from 'react';
import { Space, Select, Input, Button, Tooltip, Tag, Modal, Switch, message } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { EyeOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { TriangleAlert, CircleCheckBig } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDebounceFn } from 'ahooks';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import { CommonStateContext } from '@/App';
import { updateAlertRules, deleteStrategy } from '@/services/warning';
import { allCates, getCateDisplayLabel } from '@/components/AdvancedWrap/utils';
import RefreshIcon from '@/components/RefreshIcon';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import OrganizeColumns, { getDefaultColumnsConfigs, setDefaultColumnsConfigs, ajustColumns } from '@/components/OrganizeColumns';
import usePagination from '@/components/usePagination';
import Tags from '@/components/TableTags/Tags';
import EnhancedTable, { getEnabledStatusColumn } from '@/components/EnhancedTable';
import { dateColumn, userColumn } from '@/components/EnhancedTable/columns';
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

const FILTER_SESSION_STORAGE_KEY = 'alert-rules-filter';
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
  const { t, i18n } = useTranslation('alertRules');
  const { busiGroups, datasourceList } = useContext(CommonStateContext);
  const { hideBusinessGroupColumn, showRowSelection, readonly, headerExtra, data, loading, setRefreshFlag, linkTarget } = props;
  let defaultFilter = {} as Filter;
  try {
    defaultFilter = JSON.parse(window.sessionStorage.getItem(FILTER_SESSION_STORAGE_KEY) || '{}');
  } catch (e) {
    console.error(e);
  }
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const saveFilter = (f: Filter) => window.sessionStorage.setItem(FILTER_SESSION_STORAGE_KEY, JSON.stringify(f));
  const [queryValue, setQueryValue] = useState<string | undefined>(defaultFilter.search);
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
        width: 100,
        sorter: (a, b) => {
          return localeCompare(a.cur_event_count, b.cur_event_count);
        },
        render: (val, record) => {
          return (
            <Tags
              type='fill'
              borderRadius={6}
              bgColor={val > 0 ? 'var(--fc-red-3)' : 'var(--fc-green-3)'}
              fontColor={val > 0 ? 'var(--fc-red-11)' : 'var(--fc-green-11)'}
              icon={() => (val > 0 ? <TriangleAlert size={14} /> : <CircleCheckBig size={14} />)}
              onTagClick={() => {
                setEventsDrawerProps({
                  ...eventsDrawerProps,
                  visible: true,
                  title: record.name,
                  rid: record.id,
                });
              }}
              data={[val > 0 ? t('status_triggered') : t('status_normal')]}
            />
          );
        },
      },
    ],
    [
      {
        title: t('table.name'),
        dataIndex: 'name',
        sorter: (a, b) => {
          return localeCompare(a.name, b.name);
        },
        render: (data, record) => {
          const groupName = !hideBusinessGroupColumn ? _.find(busiGroups, { id: record.group_id })?.name : undefined;
          return (
            <div className='flex flex-col gap-0.5'>
              <Link
                className='table-text'
                to={{
                  pathname: `/alert-rules/edit/${record.id}`,
                }}
                target={linkTarget}
              >
                {data}
              </Link>
              {groupName && <span className='text-soft text-xs'>{groupName}</span>}
            </div>
          );
        },
      },
      {
        title: t('table.severity'),
        dataIndex: 'severities',
        render: (data) => {
          return (
            <Tags
              type='fill'
              borderRadius={6}
              data={_.map(data, (severity) => `S${severity}`)}
              bgColor={(tagname: string) => {
                const bgColorMap: Record<string, string> = {
                  S1: 'var(--fc-red-3)',
                  S2: 'var(--fc-orange-3)',
                  S3: 'var(--fc-yellow-3)',
                };
                return bgColorMap[tagname] || 'var(--fc-gray-3)';
              }}
              fontColor={(tagname: string) => {
                const fontColorMap: Record<string, string> = {
                  S1: 'var(--fc-red-11)',
                  S2: 'var(--fc-orange-11)',
                  S3: 'var(--fc-yellow-11)',
                };
                return fontColorMap[tagname] || 'var(--fc-gray-11)';
              }}
            />
          );
        },
      },
      {
        title: t('table.datasource_ids'),
        dataIndex: 'datasource_ids',
        render(value, record) {
          if (!value) return null;
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
        title: t('table.append_tags'),
        dataIndex: 'append_tags',
        render(value) {
          return <Tags type='outline' maxWidth={360} data={value} />;
        },
      },
      {
        title: t('table.notify_groups_obj'),
        dataIndex: 'notify_groups_obj',
        render: (data) => {
          return <Tags type='outline' maxWidth={360} data={_.map(data, (user) => user.nickname || user.username || user.name)} />;
        },
      },
      {
        title: t('table.notify_rule_ids'),
        dataIndex: 'notify_rule_ids',
        render: (data) => {
          return (
            <Tags<number>
              type='outline'
              maxWidth={360}
              data={data}
              getKey={(id) => id}
              getLabel={(id) => _.find(notificationRules, { id })?.name || _.toString(id)}
              onTagClick={(id) => {
                const finded = _.find(notificationRules, { id });
                if (finded) {
                  window.open(`/${notificationRulesNS}/edit/${id}`, '_blank');
                } else {
                  message.warning(t('notify_rule_not_found'));
                }
              }}
            />
          );
        },
      },
      dateColumn({ title: t('table.update_at'), dataIndex: 'update_at', unix: true, sorter: (a, b) => a.update_at - b.update_at }) as any,
      userColumn({ title: t('common:table.username'), dataIndex: 'update_by', nickname: 'update_by_nickname' }) as any,
    ],
    readonly
      ? [
          {
            ...getEnabledStatusColumn({
              title: t('table.disabled'),
              dataIndex: 'disabled',
              enabledText: t('filter_disabled.0'),
              disabledText: t('filter_disabled.1'),
              enabledValue: 0,
              disabledValue: 1,
            }),

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
            ...getEnabledStatusColumn({
              title: t('table.disabled'),
              dataIndex: 'disabled',
              enabledText: t('filter_disabled.0'),
              disabledText: t('filter_disabled.1'),
              enabledValue: 0,
              disabledValue: 1,
            }),

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
        ] as any),
  );
  const { run: searchChange } = useDebounceFn(
    (search) => {
      const newFilter = { ...filter, search };
      setFilter(newFilter);
      saveFilter(newFilter);
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
              saveFilter(newFilter);
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
              saveFilter(newFilter);
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
              saveFilter(newFilter);
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
      <EnhancedTable
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
        rowActions={
          readonly
            ? undefined
            : (record: any) => {
                const anomalyEnabled = _.get(record, ['rule_config', 'anomaly_trigger', 'enable']);
                return {
                  menu: _.compact([
                    {
                      key: 'clone',
                      icon: 'copy',
                      text: t('common:btn.clone'),
                      onClick: () => {
                        window.open(`/alert-rules/edit/${record.id}?mode=clone`, '_blank');
                      },
                    },
                    record.cate === 'prometheus' && anomalyEnabled === true
                      ? {
                          key: 'brain',
                          icon: 'ai',
                          text: t('brain_result_btn'),
                          onClick: () => {
                            window.open(`/alert-rules/brain/${record.id}`, '_self');
                          },
                        }
                      : undefined,
                    {
                      key: 'delete',
                      icon: 'delete',
                      text: t('common:btn.delete'),
                      danger: true,
                      onClick: () => {
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
                      },
                    },
                  ]) as any,
                };
              }
        }
        actionColumn={{ title: t('common:table.operations'), width: 64 }}
      />
      <EventsDrawer {...eventsDrawerProps} />
    </>
  );
}
