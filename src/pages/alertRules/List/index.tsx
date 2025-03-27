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
import { useTranslation } from 'react-i18next';
import { useHistory, Link } from 'react-router-dom';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import moment from 'moment';
import { Table, Tag, Switch, Modal, Space, Button, Row, Col, message, Select, Tooltip, Input } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { EyeOutlined, InfoCircleOutlined, SearchOutlined, WarningFilled, CheckCircleFilled } from '@ant-design/icons';
import RefreshIcon from '@/components/RefreshIcon';
import usePagination from '@/components/usePagination';
import { getBusiGroupsAlertRules, updateAlertRules, deleteStrategy } from '@/services/warning';
import { CommonStateContext } from '@/App';
import Tags from '@/components/Tags';
import { DatasourceSelect, ProdSelect } from '@/components/DatasourceSelect';
import localeCompare from '@/pages/dashboard/Renderer/utils/localeCompare';
import { AlertRuleType, AlertRuleStatus } from '../types';
import MoreOperations from './MoreOperations';
import Import from './Import';
import { allCates } from '@/components/AdvancedWrap/utils';
import OrganizeColumns, { getDefaultColumnsConfigs, setDefaultColumnsConfigs, ajustColumns } from '@/components/OrganizeColumns';
import { defaultColumnsConfigs, LOCAL_STORAGE_KEY } from './constants';
import { priorityColor } from '@/utils/constant';
import EventsDrawer, { Props as EventsDrawerProps } from './EventsDrawer';

interface ListProps {
  gids?: string;
}

interface Filter {
  cate?: string;
  datasourceIds?: number[];
  search?: string;
  prod?: string;
  severities?: number[];
  disabled?: 0 | 1;
}

const FILTER_LOCAL_STORAGE_KEY = 'alert-rules-filter';

export default function List(props: ListProps) {
  const { businessGroup, busiGroups } = useContext(CommonStateContext);
  const { gids } = props;
  const { t } = useTranslation('alertRules');
  const history = useHistory();
  const { datasourceList, groupedDatasourceList, reloadGroupedDatasourceList, datasourceCateOptions } = useContext(CommonStateContext);
  const pagination = usePagination({ PAGESIZE_KEY: 'alert-rules-pagesize' });
  let defaultFilter = {} as Filter;
  try {
    defaultFilter = JSON.parse(window.sessionStorage.getItem(FILTER_LOCAL_STORAGE_KEY) || '{}');
  } catch (e) {
    console.error(e);
  }
  const [filter, setFilter] = useState<Filter>(defaultFilter as Filter);
  const [queryValue, setQueryValue] = useState(defaultFilter.search || '');
  const [selectRowKeys, setSelectRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<AlertRuleType<any>[]>([]);
  const [data, setData] = useState<AlertRuleType<any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [columnsConfigs, setColumnsConfigs] = useState<{ name: string; visible: boolean }[]>(getDefaultColumnsConfigs(defaultColumnsConfigs, LOCAL_STORAGE_KEY));
  const [eventsDrawerProps, setEventsDrawerProps] = useState<EventsDrawerProps>({
    visible: false,
    onClose: () => {
      setEventsDrawerProps({
        ...eventsDrawerProps,
        visible: false,
      });
    },
  });
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
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
              }}
            >
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
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
              }}
            >
              {_.map(data, (user) => {
                const val = user.nickname || user.username || user.name;
                return (
                  <Tooltip key={val} title={val}>
                    <Tag color='purple' style={{ maxWidth: '100%', marginRight: 0 }}>
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
    ],
  );

  const includesProm = (ids?: number[]) => {
    return _.some(ids, (id) => {
      return _.some(datasourceList, (item) => {
        if (item.id === id) return item.plugin_type === 'prometheus';
      });
    });
  };

  const filterData = () => {
    return data.filter((item) => {
      const { datasourceIds, search, prod, severities } = filter;
      const datasourceIdsWithoutHost = _.filter(datasourceIds, (id) => id !== -999);
      const lowerCaseQuery = search?.toLowerCase() || '';
      return (
        (item.name.toLowerCase().indexOf(lowerCaseQuery) > -1 || item.append_tags.join(' ').toLowerCase().indexOf(lowerCaseQuery) > -1) &&
        ((prod && prod === item.prod) || !prod) &&
        ((item.severities &&
          _.some(item.severities, (severity) => {
            if (_.isEmpty(severities)) return true;
            return _.includes(severities, severity);
          })) ||
          !item.severities) &&
        (_.some(item.datasource_ids, (id) => {
          if (includesProm(datasourceIdsWithoutHost) && id === 0) return true;
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
  const fetchData = async () => {
    setLoading(true);
    const ids = gids === '-2' ? undefined : gids;
    const { success, dat } = await getBusiGroupsAlertRules(ids);
    if (success) {
      setData(dat || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [gids]);

  const { run: searchChange } = useDebounceFn(
    (search) => {
      const newFilter = { ...filter, search };
      setFilter(newFilter);
      window.sessionStorage.setItem(FILTER_LOCAL_STORAGE_KEY, JSON.stringify(newFilter));
    },
    {
      wait: 500,
    },
  );

  const filteredData = filterData();

  return (
    <div className='n9e-border-base alert-rules-list-container' style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
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
          {businessGroup.isLeaf && gids !== '-2' && (
            <Button
              type='primary'
              onClick={() => {
                history.push(`/alert-rules/add/${businessGroup.id}`);
              }}
              className='strategy-table-search-right-create'
            >
              {t('common:btn.add')}
            </Button>
          )}
          {businessGroup.isLeaf && businessGroup.id && gids !== '-2' && (
            <Button
              onClick={() => {
                if (businessGroup.id) {
                  Import({
                    busiId: businessGroup.id,
                    refreshList: fetchData,
                    groupedDatasourceList,
                    reloadGroupedDatasourceList,
                    datasourceCateOptions,
                  });
                }
              }}
            >
              {t('common:btn.import')}
            </Button>
          )}
          {businessGroup.isLeaf && businessGroup.id && gids !== '-2' && (
            <MoreOperations bgid={businessGroup.id} selectRowKeys={selectRowKeys} selectedRows={selectedRows} getAlertRules={fetchData} />
          )}
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
        className='mt8'
        size='small'
        rowKey='id'
        showSorterTooltip={false}
        pagination={pagination}
        loading={loading}
        dataSource={filteredData}
        rowSelection={{
          selectedRowKeys: selectedRows.map((item) => item.id),
          onChange: (selectedRowKeys: React.Key[], selectedRows: AlertRuleType<any>[]) => {
            setSelectRowKeys(selectedRowKeys);
            setSelectedRows(selectedRows);
          },
        }}
        columns={ajustColumns(columns, columnsConfigs)}
      />
      <EventsDrawer {...eventsDrawerProps} />
    </div>
  );
}
