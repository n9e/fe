import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Space, Select, Tag, Tooltip } from 'antd';
import { useAntdTable } from 'ahooks';
import _ from 'lodash';
import moment from 'moment';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';

import PageLayout from '@/components/pageLayout';
import AutoRefresh from '@/components/TimeRangePicker/AutoRefresh';
import EnhancedTable from '@/components/EnhancedTable';
import EmptyGuide from '@/components/EmptyGuide';

import { NS } from '../../constants';
import { getExecutions } from '../../services';
import { ExecutionItem } from '../../types';
import formatMsToHuman from '../../utils/formatMsToHuman';
import ItemDetailDrawer from './ItemDetailDrawer';

const format = 'YYYY-MM-DD HH:mm:ss';
const defaultPageSize = 10;

const TRIGGER_BY_RE = /^(alert_rule|notify_rule)_(\d+)$/;

export default function index() {
  const { t } = useTranslation(NS);
  const history = useHistory();
  const search = useLocation().search;
  const searchParams = queryString.parse(search);
  const pipelineId = searchParams.pipeline_id ? _.toNumber(searchParams.pipeline_id) : undefined;
  const [filters, setFilters] = useState<{
    pipeline_name?: string;
    mode?: string;
    status?: string;
  }>({});

  const service = ({ current, pageSize }) => {
    return getExecutions({
      ...filters,
      p: current,
      limit: pageSize,
      pipeline_id: pipelineId !== undefined && !_.isNaN(pipelineId) ? pipelineId : undefined,
    });
  };

  const { tableProps, run, params } = useAntdTable(service, {
    refreshDeps: [JSON.stringify(filters), pipelineId],
    defaultPageSize,
  });

  const statusMap = {
    running: <Tag color='purple'>{t('executions.status.running')}</Tag>,
    success: <Tag color='green'>{t('executions.status.success')}</Tag>,
    failed: <Tag color='red'>{t('executions.status.failed')}</Tag>,
  };

  const [itemDetailDrawerState, setItemDetailDrawerState] = useState<{
    id: string | null;
    visible: boolean;
  }>({
    id: null,
    visible: false,
  });

  const dataSource = (tableProps.dataSource ?? []) as ExecutionItem[];
  const hasFilters = !!(filters.pipeline_name || filters.mode || filters.status);
  // 从列表数据里取当前 pipeline 的名字，用于顶部筛选 chip
  const pipelineName = pipelineId !== undefined ? _.get(dataSource, [0, 'pipeline_name']) || pipelineId : undefined;

  const renderTriggerBy = (value: string) => {
    const m = TRIGGER_BY_RE.exec(value || '');
    if (!m) return value || '-';
    const id = m[2];
    if (m[1] === 'alert_rule') {
      return <a onClick={() => history.push(`/alert-rules/edit/${id}`)}>{t('executions.trigger_by_alert_rule', { id })}</a>;
    }
    return <a onClick={() => history.push(`/notification-rules/edit/${id}`)}>{t('executions.trigger_by_notify_rule', { id })}</a>;
  };

  return (
    <>
      <PageLayout title={t('executions.title')} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/executions/'>
        <div className='n9e'>
          <div className='flex items-center justify-between mb-4'>
            <Space wrap>
              <AutoRefresh
                onRefresh={() => {
                  run({
                    current: params?.[0]?.current ?? 1,
                    pageSize: params?.[0]?.pageSize ?? defaultPageSize,
                  });
                }}
              />
              <Input.Search placeholder={t('executions.search_placeholder')} onSearch={(val) => setFilters((prev) => ({ ...prev, pipeline_name: val }))} allowClear />
              <Select
                allowClear
                placeholder={t('trigger_mode.label')}
                options={[
                  { label: t('trigger_mode.event'), value: 'event' },
                  { label: t('trigger_mode.api'), value: 'api' },
                ]}
                value={filters.mode}
                onChange={(value) => setFilters((prev) => ({ ...prev, mode: value }))}
              />
              <Select
                allowClear
                placeholder={t('executions.status.label')}
                options={[
                  { label: t('executions.status.running'), value: 'running' },
                  { label: t('executions.status.success'), value: 'success' },
                  { label: t('executions.status.failed'), value: 'failed' },
                ]}
                value={filters.status}
                onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              />
            </Space>
            {pipelineId !== undefined && (
              <Space>
                <Tag closable onClose={() => history.push('/event-pipelines-executions')}>
                  {t('executions.filtered_by', { name: pipelineName })}
                </Tag>
                <a onClick={() => history.push('/event-pipelines-executions')}>{t('executions.view_all')}</a>
              </Space>
            )}
          </div>
          <EnhancedTable
            {...tableProps}
            size='small'
            rowKey='id'
            scroll={{ x: 'max-content' }}
            locale={
              !hasFilters && pipelineId === undefined && !tableProps.loading && dataSource.length === 0
                ? { emptyText: <EmptyGuide title={t('executions.empty_guide.title')} description={t('executions.empty_guide.desc')} /> }
                : undefined
            }
            columns={[
              {
                title: t('executions.pipeline_name'),
                dataIndex: 'pipeline_name',
                render: (value, record: ExecutionItem) => {
                  return <a onClick={() => setItemDetailDrawerState({ id: record.id, visible: true })}>{value}</a>;
                },
              },
              {
                title: t('executions.event_id'),
                dataIndex: 'event_id',
                width: 100,
                render: (value) => (value ? <a onClick={() => history.push(`/alert-his-events/${value}`)}>{value}</a> : '-'),
              },
              {
                title: t('executions.mode'),
                dataIndex: 'mode',
                width: 100,
                render: (value) => <Tag color={value === 'api' ? 'gold' : 'blue'}>{t(`trigger_mode.${value}`)}</Tag>,
              },
              {
                title: t('executions.status.label'),
                dataIndex: 'status',
                width: 90,
                render: (value) => statusMap[value] || value,
              },
              {
                title: t('executions.trigger_by'),
                dataIndex: 'trigger_by',
                width: 140,
                render: renderTriggerBy,
              },
              {
                title: t('executions.created_at'),
                dataIndex: 'created_at',
                width: 160,
                render: (value) => moment.unix(value).format(format),
              },
              {
                title: t('executions.duration_ms'),
                dataIndex: 'duration_ms',
                width: 100,
                render: (value) => (value ? formatMsToHuman(value) : '-'),
              },
              {
                title: t('executions.error_message'),
                dataIndex: 'error_message',
                width: 220,
                render: (value) =>
                  value ? (
                    <Tooltip title={value}>
                      <div className='text-error truncate' style={{ maxWidth: 220 }}>
                        {value}
                      </div>
                    </Tooltip>
                  ) : (
                    '-'
                  ),
              },
            ]}
          />
        </div>
      </PageLayout>
      <ItemDetailDrawer id={itemDetailDrawerState.id} visible={itemDetailDrawerState.visible} onClose={() => setItemDetailDrawerState({ id: null, visible: false })} />
    </>
  );
}
