/*
 * Grafana 导入两步式：转换报告视图。
 * 展示转换结果概览、迁移台账、不支持项，并提供「确认导入 / 返回修改 / 复制 Markdown 报告」。
 */
import React from 'react';
import { Alert, Button, Collapse, Descriptions, Space, Table, Tag, message } from 'antd';
import { useTranslation } from 'react-i18next';

import type { ConvertResult } from '@/pages/dashboard/utils/grafanaImport';

interface Props {
  result: ConvertResult;
  /** 保存（createDashboard）失败的错误信息；存在时展示在顶部并允许重试 */
  error?: string;
  saving: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

const actionColors: Record<string, string> = {
  dropped: 'red',
  downgraded: 'orange',
  defaulted: 'default',
};
const statusColors: Record<string, string> = {
  applied: 'green',
  'not-applicable': 'default',
  skipped: 'orange',
};

/** 序列化为 skill 风格的 Markdown 报告（便于反馈排障） */
export function buildMarkdownReport(result: ConvertResult): string {
  const { report } = result;
  const lines: string[] = [];
  lines.push('## Migration ledger');
  lines.push(`- input schemaVersion: ${report.migration.inputSchemaVersion} -> target: ${report.migration.targetSchemaVersion}`);
  for (const m of report.migration.migrations) {
    lines.push(`- v${m.version}: ${m.status} - ${m.reason}`);
  }
  lines.push('');
  lines.push('## Unsupported items');
  if (report.unsupportedItems.length === 0) {
    lines.push('No unsupported configuration was found');
  } else {
    lines.push('| scope | path | action | reason |');
    lines.push('| --- | --- | --- | --- |');
    for (const item of report.unsupportedItems) {
      lines.push(`| ${item.scope} | ${item.path || '-'} | ${item.action} | ${item.reason} |`);
    }
  }
  return lines.join('\n');
}

export default function ImportGrafanaReport(props: Props) {
  const { t } = useTranslation('dashboard');
  const { result, error, saving, onConfirm, onBack } = props;
  const { dashboard, report } = result;
  const summary = report.summary;
  const hasUnsupported = report.unsupportedItems.length > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(buildMarkdownReport(result));
      message.success(t('batch.import_grafana_report.copied'));
    } catch (e) {
      message.error(t('batch.import_grafana_report.copy'));
    }
  };

  return (
    <div>
      {error ? (
        <Alert
          type='error'
          showIcon
          message={t('batch.import_grafana_report.save_error')}
          description={
            <pre className='mb-0' style={{ whiteSpace: 'pre-wrap' }}>
              {error}
            </pre>
          }
          style={{ marginBottom: 12 }}
        />
      ) : (
        <Alert
          type={hasUnsupported ? 'warning' : 'success'}
          showIcon
          message={t('batch.import_grafana_report.title')}
          description={
            <Space size={16} wrap>
              <span>
                {t('batch.import_grafana_report.panels')}: {summary?.convertedPanels}/{summary?.panels}
              </span>
              <span>
                {t('batch.import_grafana_report.targets')}: {summary?.targets}
              </span>
              <span>
                {t('batch.import_grafana_report.variables')}: {summary?.variables}
              </span>
              {(summary?.droppedPanels ?? 0) > 0 && (
                <Tag color='red'>
                  {t('batch.import_grafana_report.dropped')} {summary?.droppedPanels}
                </Tag>
              )}
              {(summary?.droppedTargets ?? 0) > 0 && (
                <Tag color='red'>
                  {t('batch.import_grafana_report.dropped')} {summary?.droppedTargets}
                </Tag>
              )}
              {(summary?.droppedVariables ?? 0) > 0 && (
                <Tag color='red'>
                  {t('batch.import_grafana_report.dropped')} {summary?.droppedVariables}
                </Tag>
              )}
            </Space>
          }
          style={{ marginBottom: 12 }}
        />
      )}

      <Collapse ghost defaultActiveKey={['unsupported']} style={{ marginBottom: 12 }}>
        <Collapse.Panel header={`${t('batch.import_grafana_report.unsupported')} (${report.unsupportedItems.length})`} key='unsupported'>
          {report.unsupportedItems.length === 0 ? (
            <span>{t('batch.import_grafana_report.unsupported_empty')}</span>
          ) : (
            <Table
              size='small'
              className='samll_table'
              pagination={false}
              rowKey={(r) => `${r.scope}-${r.path}-${r.action}-${r.reason}`}
              dataSource={report.unsupportedItems}
              columns={[
                { title: t('batch.import_grafana_report.scope'), dataIndex: 'scope', width: 90 },
                { title: t('batch.import_grafana_report.path'), dataIndex: 'path', ellipsis: true },
                { title: t('batch.import_grafana_report.action'), dataIndex: 'action', width: 110, render: (v: string) => <Tag color={actionColors[v]}>{v}</Tag> },
                { title: t('batch.import_grafana_report.reason'), dataIndex: 'reason' },
              ]}
              scroll={{ y: 220 }}
            />
          )}
        </Collapse.Panel>
        <Collapse.Panel header={t('batch.import_grafana_report.ledger')} key='ledger'>
          <Descriptions size='small' column={1} style={{ marginBottom: 8 }}>
            <Descriptions.Item label={t('batch.import_grafana_report.schema')}>
              {report.migration.inputSchemaVersion} → {report.migration.targetSchemaVersion}
            </Descriptions.Item>
          </Descriptions>
          <Table
            size='small'
            className='samll_table'
            pagination={false}
            rowKey='version'
            dataSource={report.migration.migrations}
            columns={[
              { title: t('batch.import_grafana_report.version'), dataIndex: 'version', width: 80 },
              { title: t('batch.import_grafana_report.status'), dataIndex: 'status', width: 140, render: (v: string) => <Tag color={statusColors[v]}>{v}</Tag> },
              { title: t('batch.import_grafana_report.reason'), dataIndex: 'reason' },
            ]}
            scroll={{ y: 200 }}
          />
        </Collapse.Panel>
      </Collapse>

      <Space>
        <Button type='primary' loading={saving} onClick={onConfirm}>
          {t('batch.import_grafana_report.confirm')}
        </Button>
        <Button onClick={onBack}>{t('batch.import_grafana_report.back')}</Button>
        <Button onClick={handleCopy}>{t('batch.import_grafana_report.copy')}</Button>
      </Space>
    </div>
  );
}
