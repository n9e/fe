import React, { useMemo } from 'react';
import _ from 'lodash';
import i18next from 'i18next';
import { Form, Row, Col, Divider, Tooltip } from 'antd';
import { useRequest } from 'ahooks';
import { useTranslation } from 'react-i18next';

import moment from 'moment-timezone';

import { cn } from '@/utils';

import { useFormNGData } from '../../context';
import { getDatasourcesByQueries } from '../DatasourceValueSelect/services';

interface IProps {
  datasourceList: { id: number; name: string }[];
}

const cateNameMap: Record<string, string> = {
  prometheus: 'Prometheus',
  elasticsearch: 'Elasticsearch',
  opensearch: 'OpenSearch',
  tdengine: 'TDengine',
  loki: 'Loki',
  victorialogs: 'VictoriaLogs',
  doris: 'Doris',
  host: 'Host',
};

function SectionTitle(props: { children: React.ReactNode }) {
  return (
    <div className='flex items-center gap-1.5 text-[12px] font-medium text-foreground mb-2.5'>
      <span className='w-0.5 h-3 rounded-full bg-primary/60' />
      {props.children}
    </div>
  );
}

function FieldLabel(props: { children: React.ReactNode }) {
  return <div className='text-muted-foreground text-[11px] mb-1'>{props.children}</div>;
}

function FieldValue(props: { children: React.ReactNode }) {
  return <div className='text-foreground break-words'>{props.children}</div>;
}

function Field(props: { children: React.ReactNode; noMargin?: boolean }) {
  return <div className={props.noMargin ? '' : 'mb-2'}>{props.children}</div>;
}

function ThemeTag(props: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded border border-primary/30 text-primary bg-primary/5 px-0.5 py-0 text-[11px]', props.className)}>{props.children}</span>
  );
}

interface SwitchFieldProps {
  label: string;
  value: boolean | undefined;
  trueText?: string;
  falseText?: string;
  noMargin?: boolean;
}

function SwitchField({ label, value, trueText = i18next.t('common:yes'), falseText = i18next.t('common:no'), noMargin }: SwitchFieldProps) {
  if (value === undefined) return null;
  return (
    <div className={cn('flex items-center gap-1 text-[11px]', noMargin ? '' : 'mb-2')}>
      <span className='text-muted-foreground'>{label}:</span>
      <span className='text-foreground'>{value ? trueText : falseText}</span>
    </div>
  );
}

function ShortField({ label, value, noMargin }: SwitchFieldProps) {
  if (value === undefined) return null;
  return (
    <div className={cn('flex items-center gap-1 text-[11px]', noMargin ? '' : 'mb-2')}>
      <span className='text-muted-foreground'>{label}:</span>
      <span className='text-foreground'>{value}</span>
    </div>
  );
}

const MAX_VISIBLE_DATASOURCES = 3;

// ---- 数据源卡片 ----
function DatasourceSummary({ datasourceList }: { datasourceList: { id: number; name: string }[] }) {
  const { t } = useTranslation('alertRules');
  const cate = Form.useWatch('cate');
  const datasourceQueries = Form.useWatch('datasource_queries');

  const { data: resolvedDatasources } = useRequest(
    () =>
      getDatasourcesByQueries({
        datasource_cate: cate,
        datasource_queries: datasourceQueries,
      }),
    {
      ready: !!cate && !_.isEmpty(datasourceQueries),
      refreshDeps: [JSON.stringify(datasourceQueries), cate],
    },
  );

  const instanceNames = useMemo(() => {
    if (!_.isArray(resolvedDatasources)) return [];
    return resolvedDatasources.map((item: any) => item.name);
  }, [resolvedDatasources]);

  const visibleNames = instanceNames.slice(0, MAX_VISIBLE_DATASOURCES);
  const extraCount = instanceNames.length - MAX_VISIBLE_DATASOURCES;

  if (!cate && instanceNames.length === 0) return null;

  return (
    <>
      <div>
        <SectionTitle>{t('datasource_configs')}</SectionTitle>
        <Field>
          <FieldLabel>{t('table.cate')}</FieldLabel>
          <FieldValue>{cateNameMap[cate] || cate}</FieldValue>
        </Field>
        {instanceNames.length > 0 && (
          <Field noMargin>
            <FieldLabel>{t('form_ng.instance')}</FieldLabel>
            <div className='flex flex-wrap items-center gap-1'>
              {visibleNames.map((name: string) => (
                <ThemeTag key={name}>{name}</ThemeTag>
              ))}
              {extraCount > 0 && <span className='text-[11px] text-soft'>+{extraCount}</span>}
            </div>
          </Field>
        )}
      </div>
      <Divider />
    </>
  );
}

// ---- 事件处理卡片 ----
function PipelineSummary() {
  const { t } = useTranslation('alertRules');
  const { workflowMap } = useFormNGData();
  const pipelineConfigs = Form.useWatch('pipeline_configs');
  const eventRelabelConfig = Form.useWatch(['rule_config', 'event_relabel_config']);
  const annotations = Form.useWatch('annotations');
  const enrichQueries = Form.useWatch(['extra_config', 'enrich_queries']);

  const pipelineLabels = useMemo(() => {
    if (!_.isArray(pipelineConfigs)) return [];
    return pipelineConfigs
      .map((pc: any) => {
        const id = pc?.pipeline_id;
        if (_.isNumber(id)) {
          return workflowMap[id]?.name ?? String(id);
        }
        return id;
      })
      .filter(Boolean);
  }, [pipelineConfigs, workflowMap]);

  const hasRelabel = _.isArray(eventRelabelConfig) && eventRelabelConfig.length > 0;
  const hasAnnotations = _.isArray(annotations) && annotations.length > 0;
  const hasEnrichQueries = _.isArray(enrichQueries) && enrichQueries.length > 0;
  const hasPipelineContent = _.isArray(pipelineConfigs) && _.some(pipelineConfigs, (pc) => _.isNumber(pc?.pipeline_id));
  const hasAnyPipeline = hasPipelineContent || hasRelabel || hasAnnotations || hasEnrichQueries;

  if (!hasAnyPipeline) return null;

  return (
    <>
      <div>
        <SectionTitle>{t('form_ng.pipeline_configs')}</SectionTitle>
        {pipelineLabels.length > 0 && (
          <Field>
            <FieldLabel>{t('form_ng.workflow')}</FieldLabel>
            <FieldValue>
              {_.map(pipelineLabels, (item) => {
                return <ThemeTag key={item}>{item}</ThemeTag>;
              })}
            </FieldValue>
          </Field>
        )}
        <Row gutter={8}>
          {hasRelabel && (
            <>
              <Col span={8}>
                <FieldLabel>Relabel</FieldLabel>
                <FieldValue>{t('form_ng.items_count', { count: eventRelabelConfig.length })}</FieldValue>
              </Col>
            </>
          )}
          {hasAnnotations && (
            <Col span={8}>
              <FieldLabel>{t('annotations')}</FieldLabel>
              <FieldValue>{t('form_ng.items_count', { count: annotations.length })}</FieldValue>
            </Col>
          )}
          {hasEnrichQueries && (
            <Col span={8}>
              <FieldLabel>{t('form_ng.enrich_queries_title')}</FieldLabel>
              <FieldValue>{t('form_ng.items_count', { count: enrichQueries.length })}</FieldValue>
            </Col>
          )}
        </Row>
      </div>
      <Divider />
    </>
  );
}

// ---- 生效配置卡片 ----
function EffectiveSummary() {
  const { t } = useTranslation('alertRules');
  const { serviceCalMap } = useFormNGData();
  const enableStatus = Form.useWatch('enable_status');
  const effectiveTime = Form.useWatch('effective_time');
  const enableInBg = Form.useWatch('enable_in_bg');
  const serviceCalConfigs = Form.useWatch(['extra_config', 'service_cal_configs']);
  const timeZone = Form.useWatch('time_zone');

  const hasServiceCal = _.isArray(serviceCalConfigs) && serviceCalConfigs.length > 0;

  const weekdays = useMemo(() => t('form_ng.weekdays_short', { returnObjects: true }) as string[], []);

  return (
    <>
      <div>
        <SectionTitle>{t('effective_configs')}</SectionTitle>
        <SwitchField label={t('enable_status')} value={enableStatus} />
        <ShortField label={t('time_zone')} value={timeZone === 'Local' ? `Local (${t('local_time')})` : timeZone} />
        <Field>
          <FieldLabel>{t('form_ng.effective_time_window')}</FieldLabel>
          <FieldValue>
            {_.map(effectiveTime, (item: any, idx: number) => {
              const days = _.isArray(item?.enable_days_of_week) ? item.enable_days_of_week : [];
              const stime = item?.enable_stime;
              const etime = item?.enable_etime;
              const timeLabel = stime && etime ? `${stime.format ? stime.format('HH:mm') : stime} ~ ${etime.format ? etime.format('HH:mm') : etime}` : '';
              const localText =
                timeZone && timeZone !== 'Local' && stime && etime
                  ? `${moment
                      .tz(stime.format ? stime.format('HH:mm') : stime, 'HH:mm', timeZone)
                      .local()
                      .format('HH:mm')} ~ ${moment
                      .tz(etime.format ? etime.format('HH:mm') : etime, 'HH:mm', timeZone)
                      .local()
                      .format('HH:mm')}`
                  : '';
              return (
                <div key={idx} className='flex items-center gap-1 flex-wrap mb-1'>
                  {days.map((d: string) => (
                    <ThemeTag key={d}>{weekdays[Number(d)] || d}</ThemeTag>
                  ))}
                  {timeLabel && (
                    <Tooltip title={localText ? `${t('local_time')}: ${localText}` : undefined}>
                      <span className='text-foreground text-[10px]'>{timeLabel}</span>
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </FieldValue>
        </Field>
        {hasServiceCal && (
          <Field>
            <FieldLabel>{t('form_ng.service_calendar')}</FieldLabel>
            <FieldValue>
              {serviceCalConfigs.map((item: any, idx: number) => {
                const calIds = _.isArray(item?.service_cal_ids) ? item.service_cal_ids : [];
                const timeRange = item?.time_range;
                const rangeLabel =
                  timeRange?.start && timeRange?.end
                    ? `${timeRange.start.format ? timeRange.start.format('HH:mm') : timeRange.start} ~ ${timeRange.end.format ? timeRange.end.format('HH:mm') : timeRange.end}`
                    : '';
                const rangeLocalText =
                  timeZone && timeZone !== 'Local' && timeRange?.start && timeRange?.end
                    ? `${moment
                        .tz(timeRange.start.format ? timeRange.start.format('HH:mm') : timeRange.start, 'HH:mm', timeZone)
                        .local()
                        .format('HH:mm')} ~ ${moment
                        .tz(timeRange.end.format ? timeRange.end.format('HH:mm') : timeRange.end, 'HH:mm', timeZone)
                        .local()
                        .format('HH:mm')}`
                    : '';
                return (
                  <div key={idx} className='flex items-center gap-1 flex-wrap mb-0.5'>
                    {calIds.map((id: number) => (
                      <ThemeTag key={id}>{serviceCalMap[id]?.name ?? `#${id}`}</ThemeTag>
                    ))}
                    {rangeLabel && (
                      <Tooltip title={rangeLocalText ? `${t('local_time')}: ${rangeLocalText}` : undefined}>
                        <span className='text-foreground text-[11px]'>{rangeLabel}</span>
                      </Tooltip>
                    )}
                  </div>
                );
              })}
            </FieldValue>
          </Field>
        )}
        <SwitchField label={t('enable_in_bg')} value={enableInBg} />
      </div>
      <Divider />
    </>
  );
}

// ---- 通知设置卡片 ----
function NotifySummary() {
  const { t } = useTranslation('alertRules');
  const { notificationRuleMap, teamMap, notifyChannelMap } = useFormNGData();
  const notifyVersion = Form.useWatch('notify_version');
  const notifyRuleIds = Form.useWatch('notify_rule_ids');
  const notifyChannels = Form.useWatch('notify_channels');
  const notifyGroups = Form.useWatch('notify_groups');
  const notifyRepeatStep = Form.useWatch('notify_repeat_step');
  const notifyMaxNumber = Form.useWatch('notify_max_number');
  const notifyRecovered = Form.useWatch('notify_recovered');
  const recoverDuration = Form.useWatch('recover_duration');

  const notifyRuleNames = useMemo(() => {
    if (!_.isArray(notifyRuleIds) || notifyRuleIds.length === 0) return [];
    return notifyRuleIds.map((id: number) => notificationRuleMap[id]?.name ?? String(id));
  }, [notificationRuleMap, notifyRuleIds]);

  const hasNotifyV1 = notifyVersion === 1 && notifyRuleNames.length > 0;
  const hasNotifyV0 = notifyVersion === 0 && (_.isArray(notifyChannels) || _.isArray(notifyGroups));
  const hasBasicFields = notifyRepeatStep !== undefined || notifyMaxNumber !== undefined || notifyRecovered !== undefined;

  if (!hasNotifyV1 && !hasNotifyV0 && !hasBasicFields) return null;

  return (
    <div>
      <SectionTitle>{t('notify_configs')}</SectionTitle>
      {notifyVersion === 1 && notifyRuleNames.length > 0 && (
        <Field>
          <FieldLabel>{t('notify_rule_ids')}</FieldLabel>
          <div className='flex flex-wrap gap-1 mb-2'>
            {notifyRuleNames.map((name: string) => (
              <ThemeTag key={name}>{name}</ThemeTag>
            ))}
          </div>
        </Field>
      )}
      {notifyVersion === 0 && (
        <>
          {_.isArray(notifyChannels) && notifyChannels.length > 0 && (
            <Field>
              <FieldLabel>{t('notify_channels')}</FieldLabel>
              <div className='flex flex-wrap gap-1'>
                {notifyChannels.map((key: string) => (
                  <ThemeTag key={key}>{notifyChannelMap[key]?.label ?? key}</ThemeTag>
                ))}
              </div>
            </Field>
          )}
          {_.isArray(notifyGroups) && notifyGroups.length > 0 && (
            <Field>
              <FieldLabel>{t('notify_groups')}</FieldLabel>
              <div className='flex flex-wrap gap-1'>
                {notifyGroups.map((id: string) => (
                  <ThemeTag key={id}>{teamMap[id]?.name ?? id}</ThemeTag>
                ))}
              </div>
            </Field>
          )}
        </>
      )}
      {notifyRecovered !== undefined && (
        <SwitchField label={t('notify_recovered')} value={notifyRecovered} trueText={`${t('form_ng.enabled_on')}`} falseText={`${t('form_ng.enabled_off')}`} />
      )}
      <Row gutter={8}>
        {recoverDuration !== undefined && (
          <Col span={8}>
            <FieldLabel>{t('form_ng.recover_duration_short')}</FieldLabel>
            <FieldValue>
              {recoverDuration} {t('form_ng.second_unit')}
            </FieldValue>
          </Col>
        )}
        {notifyRepeatStep !== undefined && (
          <Col span={8}>
            <FieldLabel>{t('form_ng.notify_repeat_step_short')}</FieldLabel>
            <FieldValue>
              {notifyRepeatStep} {t('form_ng.minute_unit')}
            </FieldValue>
          </Col>
        )}
        {notifyMaxNumber !== undefined && (
          <Col span={8}>
            <FieldLabel>{t('notify_max_number')}</FieldLabel>
            <FieldValue>{notifyMaxNumber === 0 ? t('form_ng.unlimited') : notifyMaxNumber}</FieldValue>
          </Col>
        )}
      </Row>
    </div>
  );
}

export default function RuleSummary(props: IProps) {
  const { datasourceList } = props;

  return (
    <>
      <DatasourceSummary datasourceList={datasourceList} />
      <PipelineSummary />
      <EffectiveSummary />
      <NotifySummary />
    </>
  );
}
