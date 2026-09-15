import React, { useState, useContext, useRef, useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Space } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import queryString from 'query-string';
import { useAntdTable } from 'ahooks';

import { CommonStateContext } from '@/App';
import { parseRange } from '@/components/TimeRangePicker';
import usePagination from '@/components/usePagination';
import { allCates } from '@/components/AdvancedWrap/utils';
import { IS_PLUS } from '@/utils/constant';
import getTextWidth from '@/utils/getTextWidth';

import { ackEvents, getEvents, getEventById } from '../../services';
import deleteAlertEventsModal from '../../utils/deleteAlertEventsModal';
import { NS, SEVERITY_COLORS, EVENTS_TABLE_PAGESIZE_CACHE_KEY } from '../../constants';
import { FilterType } from '../../types';
import EventDetailDrawer from './EventDetailDrawer';
import EnhancedTable from '@/components/EnhancedTable';
import Tags from '@/components/TableTags/Tags';
import type { AlertEventTagsDisplayMode } from '../../utils/eventColumnExpandedStorage';

interface IProps {
  filter: FilterType;
  setFilter: (patch: Partial<FilterType>) => void;
  params: any;
  refreshFlag: string;
  selectedRowKeys: number[];
  setSelectedRowKeys: (selectedRowKeys: number[]) => void;
  setRefreshFlag: (refreshFlag: string) => void;
  tagDisplayMode: AlertEventTagsDisplayMode;
  alertEscalationEnable: boolean;
  isFullscreen: boolean;
}

function formatDuration(ms: number) {
  const d = moment.duration(ms);
  const totalDays = d.asDays();
  const totalHours = d.asHours();
  const totalMinutes = d.asMinutes();

  if (totalDays >= 1) {
    return `${totalDays.toFixed(1)} d`;
  } else {
    const hours = Math.floor(totalHours);
    const minutes = totalMinutes % 60;

    let result: string[] = [];
    if (hours > 0) {
      result.push(`${hours} h`);
    }
    if (minutes > 0 || hours === 0) {
      result.push(`${minutes.toFixed(1)} min`);
    }
    return result.join(' ');
  }
}

export default function AlertTable(props: IProps) {
  const { filter, setFilter, selectedRowKeys, setSelectedRowKeys, params, setRefreshFlag, tagDisplayMode, alertEscalationEnable, isFullscreen } = props;
  const history = useHistory();
  const { t } = useTranslation(NS);
  const { datasourceList } = useContext(CommonStateContext);
  const location = useLocation();
  const [eventDetailDrawerData, setEventDetailDrawerData] = useState<{
    visible: boolean;
    data?: any;
  }>({
    visible: false,
  });
  const lastInitiatedViewIdRef = useRef<number | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableHeaderHeight, setTableHeaderHeight] = useState<number>();
  const [newFullscreenEventKeys, setNewFullscreenEventKeys] = useState<Set<string>>(new Set());
  const previousFullscreenPageRef = useRef<{ queryKey: string; eventKeys: Set<string> }>();
  // TimeRangePicker 会在刷新时向 range 写入 refreshFlag；它不参与接口筛选，不能让它重置新增事件的对比基准。
  const fullscreenQueryKey = JSON.stringify({
    ...params,
    range: params.range ? _.omit(params.range, ['refreshFlag']) : params.range,
  });

  useEffect(() => {
    previousFullscreenPageRef.current = undefined;
    setNewFullscreenEventKeys(new Set());
  }, [fullscreenQueryKey, isFullscreen]);

  useEffect(() => {
    const parsed = queryString.parse(location.search);
    const viewId = parsed.viewId;
    if (viewId && Number(viewId) !== lastInitiatedViewIdRef.current) {
      lastInitiatedViewIdRef.current = Number(viewId);
      getEventById(Number(viewId)).then((res) => {
        setEventDetailDrawerData({
          visible: true,
          data: res.dat,
        });
      });
    }
  }, [location.search]);

  const columns = [
    {
      title: t('event_name'),
      dataIndex: 'rule_name',
      render(title, record) {
        const currentDatasourceCate = _.find(allCates, { value: record.cate });
        const currentDatasource = _.find(datasourceList, { id: record.datasource_id });
        const tags = record.tags || [];
        const addTagToFilter = (item: string) => {
          if (!_.includes(filter.query, item)) {
            setFilter({ query: filter.query ? `${filter.query.trim()} ${item}` : item });
          }
        };

        return (
          <div className='alert-event-content max-w-[60vw]'>
            <div className='alert-event-title mb-2'>
              <Space>
                {currentDatasourceCate && currentDatasource ? (
                  <Space>
                    <img src={currentDatasourceCate.logo} height={14} />
                    {currentDatasource.name}
                    <span>/</span>
                  </Space>
                ) : record.cate === 'host' ? (
                  <Space>
                    <img src='/image/logos/host.png' height={14} />
                    <span>/</span>
                  </Space>
                ) : null}
                <a
                  onClick={() => {
                    lastInitiatedViewIdRef.current = record.id;
                    getEventById(record.id).then((res) => {
                      setEventDetailDrawerData({
                        visible: true,
                        data: res.dat,
                      });
                      const parsed = queryString.parse(location.search);
                      parsed.viewId = String(record.id);
                      history.replace({
                        search: queryString.stringify(parsed, { arrayFormat: 'comma' }),
                      });
                    });
                  }}
                >
                  {title}
                </a>
              </Space>
            </div>
            {tagDisplayMode === 'all' ? (
              // 所有：全部标签内联铺开（双击加入筛选）
              <div className='alert-event-tags is-expanded'>
                {_.map(tags, (item) => (
                  <Tag key={item} style={{ maxWidth: '100%' }} onDoubleClick={() => addTagToFilter(item)}>
                    <div style={{ maxWidth: 'max-content', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item}</div>
                  </Tag>
                ))}
              </div>
            ) : tagDisplayMode === 'compact' ? (
              // 精简：固定展示前 3 个，+N 悬浮弹层展示全部标签（单击标签加入筛选）
              <Tags data={tags} type='outline' maxCount={3} onTagClick={(item) => addTagToFilter(item as string)} />
            ) : null}
          </div>
        );
      },
    },
    {
      title: t('trigger_time'),
      dataIndex: 'trigger_time',
      render(value) {
        return (
          <div
            style={{
              minWidth: getTextWidth(t('trigger_time')),
            }}
          >
            {moment(value * 1000).format('YYYY-MM-DD HH:mm:ss')}
          </div>
        );
      },
    },
    {
      title: t('trigger_value'),
      dataIndex: 'trigger_value',
      render(value) {
        return (
          <div
            style={{
              minWidth: getTextWidth(t('trigger_value')),
            }}
          >
            {value}
          </div>
        );
      },
    },
    {
      title: t('duration'),
      dataIndex: 'duration',
      render(_, record) {
        const duration = moment().diff(moment(record.first_trigger_time * 1000));
        const maxGrids = 12;
        const hours = duration / 3600000;
        const highlight = hours >= 24 ? maxGrids : Math.floor(hours / 2);
        const getColorClass = (idx: number) => {
          if (idx < 4) return 'segment-left';
          if (idx < 8) return 'segment-middle';
          return 'segment-right';
        };
        return (
          <div
            style={{
              minWidth: getTextWidth(t('duration')),
            }}
          >
            {formatDuration(duration)}
            <div className='flex gap-[2px]'>
              {Array.from({ length: maxGrids }).map((_, idx) => {
                const colorClass = getColorClass(idx);
                const isActive = idx < highlight;
                return <div key={idx} className={`duration-bar-segment ${colorClass} ${isActive ? 'active' : 'inactive'}`} />;
              })}
            </div>
          </div>
        );
      },
    },
  ];

  if (import.meta.env.VITE_IS_PRO === 'true') {
    columns.splice(3, 0, {
      title: t('claimant'),
      dataIndex: 'claimant',
      render: (value, record) => {
        return (
          <div
            style={{
              minWidth: getTextWidth(t('claimant')),
            }}
          >
            {record.status === 1 ? value : t('status_0')}
          </div>
        );
      },
    } as any);
  }

  const getEventIdentity = (event: { hash: string }) => event.hash;

  const fetchData = ({ current, pageSize }) => {
    const requestQueryKey = fullscreenQueryKey;
    const isFullscreenRequest = isFullscreen;
    const requestParams: any = {
      p: isFullscreen ? 1 : current,
      limit: pageSize,
      my_groups: String(params.my_groups) === 'true',
      ..._.omit(params, ['range', 'my_groups']),
    };

    if (params.range) {
      const parsedRange = parseRange(params.range);
      requestParams.stime = moment(parsedRange.start).unix();
      requestParams.etime = moment(parsedRange.end).unix();
    }
    return getEvents(requestParams).then((res) => {
      const list = res.dat.list ?? [];
      return {
        total: res.dat.total,
        list,
        requestQueryKey,
        isFullscreenRequest,
      };
    });
  };
  const { tableProps } = useAntdTable(fetchData, {
    refreshDeps: [fullscreenQueryKey, props.refreshFlag, isFullscreen],
    defaultPageSize: 30,
    debounceWait: 500,
    onSuccess: (data: { list: Array<{ hash: string }>; requestQueryKey: string; isFullscreenRequest: boolean }) => {
      if (!data.isFullscreenRequest) return;

      const eventKeys = new Set(data.list.map(getEventIdentity));
      const previousPage = previousFullscreenPageRef.current;
      const nextNewEventKeys = previousPage?.queryKey === data.requestQueryKey ? new Set([...eventKeys].filter((key) => !previousPage.eventKeys.has(key))) : new Set<string>();

      previousFullscreenPageRef.current = { queryKey: data.requestQueryKey, eventKeys };
      setNewFullscreenEventKeys(nextNewEventKeys);
    },
  });

  const pagination = usePagination({ PAGESIZE_KEY: EVENTS_TABLE_PAGESIZE_CACHE_KEY });

  useLayoutEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const measure = () => {
      const header = container.querySelector('.ant-table-thead') as HTMLElement | null;
      if (!header) return;

      const nextHeight = Math.ceil(header.getBoundingClientRect().height);
      setTableHeaderHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    };

    measure();
    const observer = new ResizeObserver(measure);
    const header = container.querySelector('.ant-table-thead');
    if (header) observer.observe(header);

    return () => observer.disconnect();
  }, [tableProps.dataSource]);

  return (
    <div ref={tableContainerRef} className='n9e-antd-table-height-full'>
      <EnhancedTable
        size='small'
        tableLayout='auto'
        scroll={!_.isEmpty(tableProps.dataSource) && tableHeaderHeight !== undefined ? { x: 'max-content', y: `calc(100% - ${tableHeaderHeight}px)` } : undefined}
        rowKey={(record) => record.id}
        columns={columns}
        {...tableProps}
        rowClassName={(record: { hash: string; severity: number; is_recovered: number }) => {
          const severityClassName = SEVERITY_COLORS[record.is_recovered ? 3 : record.severity - 1] + '-left-border';
          const shouldHighlight = isFullscreen && newFullscreenEventKeys.has(getEventIdentity(record));
          // 复用主题 violet-3（--fc-violet-3），明暗模式各自取值，避免硬编码色值。
          return shouldHighlight ? `${severityClassName} children:!bg-violet-300` : severityClassName;
        }}
        rowSelection={
          isFullscreen
            ? undefined
            : {
                selectedRowKeys: selectedRowKeys,
                onChange(selectedRowKeys: number[]) {
                  setSelectedRowKeys(selectedRowKeys);
                },
              }
        }
        pagination={
          isFullscreen
            ? false
            : {
                ...pagination,
                ...tableProps.pagination,
                pageSizeOptions: ['30', '100', '200', '500'],
              }
        }
        rowActions={
          isFullscreen
            ? undefined
            : (record) => ({
                inline: _.compact([
                  IS_PLUS && alertEscalationEnable
                    ? {
                        key: 'ack',
                        icon: record.status === 0 ? 'claim' : 'unclaim',
                        text: record.status === 0 ? t('claim') : t('unclaim'),
                        onClick: () => {
                          ackEvents([record.id], record.status === 0 ? 'ack' : 'unack').then(() => {
                            setRefreshFlag(_.uniqueId('refresh_'));
                          });
                        },
                      }
                    : undefined,
                  !_.includes(['firemap', 'northstar'], record?.rule_prod)
                    ? {
                        key: 'shield',
                        icon: 'shield',
                        text: t('shield'),
                        onClick: () => {
                          history.push({
                            pathname: '/alert-mutes/add',
                            search: queryString.stringify({
                              busiGroup: record.group_id,
                              prod: record.rule_prod,
                              cate: record.cate,
                              datasource_ids: [record.datasource_id],
                              tags: record.tags,
                            }),
                          });
                        },
                      }
                    : undefined,
                  {
                    key: 'delete',
                    icon: 'delete',
                    text: t('common:btn.delete'),
                    danger: true,
                    onClick: () =>
                      deleteAlertEventsModal(
                        [record.id],
                        () => {
                          setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.id));
                          setRefreshFlag(_.uniqueId('refresh_'));
                        },
                        t,
                      ),
                  },
                ]) as any,
              })
        }
        actionColumn={isFullscreen ? undefined : { title: t('common:table.operations'), width: 100 }}
      />
      <EventDetailDrawer
        showAckBtn
        visible={eventDetailDrawerData.visible}
        data={eventDetailDrawerData.data}
        onClose={() => {
          setEventDetailDrawerData({ visible: false });
          const parsed = queryString.parse(location.search);
          delete parsed.viewId;
          history.replace({
            search: queryString.stringify(parsed, { arrayFormat: 'comma' }),
          });
        }}
        onDeleteSuccess={() => {
          setRefreshFlag(_.uniqueId('refresh_'));
          setSelectedRowKeys([]);
        }}
        onRefresh={() => {
          setRefreshFlag(_.uniqueId('refresh_'));
          if (eventDetailDrawerData.data.id) {
            getEventById(eventDetailDrawerData.data.id).then((res) => {
              setEventDetailDrawerData({
                visible: true,
                data: res.dat,
              });
            });
          }
        }}
      />
    </div>
  );
}
