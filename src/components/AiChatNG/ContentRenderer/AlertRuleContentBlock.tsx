import React from 'react';
import { Tooltip, message as antdMessage } from 'antd';
import { CopyOutlined, ExportOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { copy2ClipBoard } from '@/utils';

interface IAlertRulePayload {
  cate?: string;
  datasource_id?: number;
  datasource_name?: string;
  for_duration?: number;
  group_id?: number;
  group_name?: string;
  id?: number;
  name?: string;
  note?: string;
  operator?: string;
  prod?: string;
  prom_ql?: string;
  severity?: number;
  threshold?: number;
  metric?: string;
}

function safeParsePayload(raw: string): IAlertRulePayload | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return undefined;
    return parsed as IAlertRulePayload;
  } catch {
    return undefined;
  }
}

function getSeverityColor(severity?: number) {
  if (severity === 1) return 'text-error';
  if (severity === 2) return 'text-alert';
  if (severity === 3) return 'text-warning';
  return 'text-main';
}

function SeverityText(props: { severity?: number; levelName?: string }) {
  const { severity, levelName } = props;
  const text = severity ? `${severity}${levelName ? ` (${levelName})` : ''}` : '--';
  const colorClass = getSeverityColor(severity);

  return (
    <span className={`inline-flex items-center gap-2 ${colorClass}`}>
      <span>{text}</span>
    </span>
  );
}

function RowItem(props: { label: string; value: React.ReactNode }) {
  return (
    <div className='grid grid-cols-[120px_1fr] gap-3 border-t border-fc-200 py-2 first:border-t-0'>
      <div className='text-sm font-medium text-title'>{props.label}</div>
      <div className='min-w-0 text-sm text-main'>{props.value}</div>
    </div>
  );
}

export default function AlertRuleContentBlock(props: { responseContent: string }) {
  const { t } = useTranslation('AiChat');
  const payload = React.useMemo(() => safeParsePayload(props.responseContent), [props.responseContent]);

  const severityLevelName = React.useMemo(() => {
    const s = payload?.severity;
    if (s === 1) return t('alert_rule.severity.critical');
    if (s === 2) return t('alert_rule.severity.warning');
    if (s === 3) return t('alert_rule.severity.info');
    return '';
  }, [payload?.severity, t]);

  if (!payload) {
    return <div className='rounded-lg border border-dashed border-fc-200 bg-fc-50 px-4 py-3 text-sm text-hint'>{t('message.unsupported_type', { type: 'alert_rule' })}</div>;
  }

  const ruleId = payload.id;
  const ruleName = payload.name;

  const groupText = payload.group_name && payload.group_id !== undefined ? `${payload.group_name} (id: ${payload.group_id})` : payload.group_name || '--';
  const datasourceText =
    payload.datasource_name && payload.datasource_id !== undefined ? `${payload.datasource_name} (id: ${payload.datasource_id})` : payload.datasource_name || '--';

  const conditionText = (() => {
    const op = payload.operator;
    const threshold = payload.threshold;
    const duration = payload.for_duration;
    const parts: string[] = [];
    if (op && threshold !== undefined) parts.push(`${op} ${threshold}`);
    if (duration !== undefined) parts.push(t('alert_rule.duration_seconds', { seconds: duration }));
    return parts.length ? parts.join(', ') : '--';
  })();

  const nameNode =
    ruleId !== undefined && ruleName ? (
      <a className='inline-flex max-w-full items-center gap-2 text-primary hover:underline' href={`/alert-rules/edit/${ruleId}`} target='_blank' rel='noopener noreferrer'>
        <span className='truncate'>{ruleName}</span>
        <ExportOutlined className='shrink-0 opacity-80' />
      </a>
    ) : (
      <span>{ruleName || '--'}</span>
    );

  const idNode = (
    <span className='inline-flex items-center gap-2'>
      <span>{ruleId !== undefined ? String(ruleId) : '--'}</span>
      {ruleId !== undefined ? (
        <CopyOutlined
          className='text-primary/80'
          onClick={() => {
            copy2ClipBoard(String(ruleId));
            antdMessage.success(t('alert_rule.copied'));
          }}
        />
      ) : null}
    </span>
  );

  return (
    <div className='rounded-lg border border-fc-200 bg-fc-100 px-4 py-3'>
      <div className='text-sm font-medium text-title'>{t('alert_rule.title')}</div>

      <div className='mt-2'>
        <RowItem label={t('alert_rule.field.id')} value={idNode} />
        <RowItem label={t('alert_rule.field.name')} value={nameNode} />
        <RowItem label={t('alert_rule.field.group')} value={groupText} />
        <RowItem label={t('alert_rule.field.datasource')} value={datasourceText} />
        <RowItem label={t('alert_rule.field.cate')} value={payload.cate || '--'} />
        <RowItem label={t('alert_rule.field.severity')} value={<SeverityText severity={payload.severity} levelName={severityLevelName} />} />
        {payload.metric ? <RowItem label={t('alert_rule.field.metric')} value={payload.metric} /> : null}
        <RowItem label={t('alert_rule.field.condition')} value={conditionText} />
        <RowItem label={t('alert_rule.field.note')} value={<div className='whitespace-pre-wrap break-words'>{payload.note || '--'}</div>} />
      </div>
    </div>
  );
}
