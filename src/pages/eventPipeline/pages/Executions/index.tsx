import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Space, Select, Table, Tag } from 'antd';
import { useAntdTable } from 'ahooks';
import _ from 'lodash';
import moment from 'moment';

import PageLayout from '@/components/pageLayout';
import AutoRefresh from '@/components/TimeRangePicker/AutoRefresh';

import { NS } from '../../constants';
import { getExecutions } from '../../services';
import formatMsToHuman from '../../utils/formatMsToHuman';
import ItemDetailDrawer from './ItemDetailDrawer';

const format = 'YYYY-MM-DD HH:mm:ss';
const defaultPageSize = 10;

export default function index() {
  const { t } = useTranslation(NS);
  const [filters, setFilters] = useState<{
    search?: string;
    mode?: string;
    status?: string;
  }>({
    search: undefined,
    mode: undefined,
    status: undefined,
  });

  const service = ({ current, pageSize }) => {
    return getExecutions({
      ...filters,
      p: current,
      limit: pageSize,
    });
  };

  const { tableProps, run, params } = useAntdTable(service, {
    refreshDeps: [JSON.stringify(filters)],
    defaultPageSize,
  });

  const statusMap = {
    running: <Tag color='purple' >{t('executions.status.running')}</Tag>,
    success: <Tag color='green'>{t('executions.status.success')}</Tag>,
    failed: <Tag color='red'>{t('executions.status.failed')}</Tag>,
  };

  const [itemDetailDrawerState, setItemDetailDrawerState] = useState<{
    id: number | null;
    visible: boolean;
  }>({
    id: null,
    visible: false,
  });

  return (
    <>
      <PageLayout title={t('executions.title')}>
        <div className='n9e'>
          <div className='flex items-center justify-between mb-4'>
            <Space wrap>
              <AutoRefresh
                onRefresh={() => {
                  if (params && params[0]) {
                    run({
                      current: params[0].current,
                      pageSize: params[0].pageSize,
                    });
                  } else {
                    run({
                      current: 1,
                      pageSize: defaultPageSize,
                    });
                  }
                }}
              />
              <Input.Search placeholder={t('executions.search_placeholder')} value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
              <Select
                allowClear
                placeholder={t('trigger_mode.label')}
                options={[
                  {
                    label: t('trigger_mode.event'),
                    value: 'event',
                  },
                  {
                    label: t('trigger_mode.api'),
                    value: 'api',
                  },
                ]}
                value={filters.mode}
                onChange={(value) => setFilters((prev) => ({ ...prev, mode: value }))}
              />
              <Select
                allowClear
                placeholder={t('executions.status.label')}
                options={[
                  {
                    label: t('executions.status.running'),
                    value: 'running',
                  },
                  {
                    label: t('executions.status.success'),
                    value: 'success',
                  },
                  {
                    label: t('executions.status.failed'),
                    value: 'failed',
                  },
                ]}
                value={filters.status}
                onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              />
            </Space>
          </div>
          <Table
            {...tableProps}
            size='small'
            rowKey='id'
            columns={[
              {
                title: t('executions.pipeline_name'),
                dataIndex: 'pipeline_name',
                key: 'pipeline_name',
                render: (value, record) => {
                  return (
                    <a
                      onClick={() => {
                        setItemDetailDrawerState((prev) => ({ ...prev, id: record.id, visible: true }));
                      }}
                    >
                      {value}
                    </a>
                  );
                },
              },
              {
                title: t('executions.mode'),
                dataIndex: 'mode',
                key: 'mode',
                width: 100,
                render: (value) => {
                  return <Tag color='green'>{t(`trigger_mode.${value}`)}</Tag>;
                },
              },
              {
                title: t('executions.status.label'),
                dataIndex: 'status',
                key: 'status',
                width: 100,
                render: (value) => {
                  return statusMap[value] || value;
                },
              },
              {
                title: t('executions.created_at'),
                dataIndex: 'created_at',
                key: 'created_at',
                width: 160,
                render: (value) => moment.unix(value).format(format),
              },
              {
                title: t('executions.finished_at'),
                dataIndex: 'finished_at',
                key: 'finished_at',
                width: 160,
                render: (value) => (value ? moment.unix(value).format(format) : '-'),
              },
              {
                title: t('executions.duration_ms'),
                dataIndex: 'duration_ms',
                key: 'duration_ms',
                width: 100,
                render: (value) => {
                  return value ? formatMsToHuman(value) : '-';
                },
              },
              {
                title: t('executions.trigger_by'),
                dataIndex: 'trigger_by',
                key: 'trigger_by',
                width: 120,
              },
            ]}
          />
        </div>
      </PageLayout>
      <ItemDetailDrawer id={itemDetailDrawerState.id} visible={itemDetailDrawerState.visible} onClose={() => setItemDetailDrawerState({ id: null, visible: false })} />
    </>
  );
}
