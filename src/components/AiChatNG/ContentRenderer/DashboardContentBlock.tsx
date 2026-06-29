import React from 'react';
import { message as antdMessage } from 'antd';
import { CopyOutlined, DashboardOutlined, ExportOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { copy2ClipBoard } from '@/utils';
import { NAME_SPACE } from '../constants';
import ContentCard from './ContentCard';
import RowItem from './RowItem';

interface IDashboardPayload {
  datasource_id?: number;
  datasource_name?: string;
  group_id?: number;
  group_name?: string;
  id?: number;
  name?: string;
  panels_count?: number;
  variables_count?: number;
  tags?: string;
}

function safeParsePayload(raw: string): IDashboardPayload | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return undefined;
    return parsed as IDashboardPayload;
  } catch {
    return undefined;
  }
}

export default function DashboardContentBlock(props: { responseContent: string }) {
  const { t } = useTranslation(NAME_SPACE);
  const payload = React.useMemo(() => safeParsePayload(props.responseContent), [props.responseContent]);

  if (!payload) {
    return <div className='rounded-lg border border-dashed border-fc-200 bg-fc-50 px-4 py-3 text-sm text-hint'>{t('message.unsupported_type', { type: 'dashboard' })}</div>;
  }

  const dashboardId = payload.id;
  const dashboardName = payload.name;

  const groupText = payload.group_name && payload.group_id !== undefined ? `${payload.group_name} (id: ${payload.group_id})` : payload.group_name || '--';
  const datasourceText =
    payload.datasource_name && payload.datasource_id !== undefined ? `${payload.datasource_name} (id: ${payload.datasource_id})` : payload.datasource_name || '--';

  const idNode = (
    <span className='inline-flex items-center gap-2'>
      <span>{dashboardId !== undefined ? String(dashboardId) : '--'}</span>
      {dashboardId !== undefined ? (
        <CopyOutlined
          className='text-primary/80'
          onClick={() => {
            copy2ClipBoard(String(dashboardId));
            antdMessage.success(t('dashboard.copied'));
          }}
        />
      ) : null}
    </span>
  );

  const nameNode =
    dashboardId !== undefined && dashboardName ? (
      <a className='inline-flex max-w-full items-center gap-2 text-primary hover:underline' href={`/dashboards/${dashboardId}`} target='_blank' rel='noopener noreferrer'>
        <span className='truncate'>{dashboardName}</span>
        <ExportOutlined className='shrink-0 opacity-80' />
      </a>
    ) : (
      <span>{dashboardName || '--'}</span>
    );

  return (
    <ContentCard icon={<DashboardOutlined />} title={t('dashboard.title')} bodyClassName='px-4 py-2'>
      <RowItem label={t('dashboard.field.id')} value={idNode} />
      <RowItem label={t('dashboard.field.name')} value={nameNode} />
      <RowItem label={t('dashboard.field.group')} value={groupText} />
      <RowItem label={t('dashboard.field.datasource')} value={datasourceText} />
      <RowItem label={t('dashboard.field.panels_count')} value={payload.panels_count !== undefined ? String(payload.panels_count) : '--'} />
      <RowItem label={t('dashboard.field.variables_count')} value={payload.variables_count !== undefined ? String(payload.variables_count) : '--'} />
      <RowItem label={t('dashboard.field.tags')} value={payload.tags || '--'} />
    </ContentCard>
  );
}
