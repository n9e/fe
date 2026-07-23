import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import i18next from 'i18next';
import { Form, Row, Col, Divider, Tooltip, Popover } from 'antd';
import { useRequest } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { LokiMonacoEditor, LogQLMonacoEditor, SqlMonacoEditor } from '@fc-components/monaco-editor';
import type { LogQLVendor } from '@fc-components/monaco-editor';

import moment from 'moment-timezone';

import { CommonStateContext } from '@/App';
import { cn } from '@/utils';
import { getTargetList } from '@/services/targets';
import PromQLInputNG from '@/components/PromQLInputNG';

// @ts-ignore
import { getCLSLogset, getCLSTopic } from 'plus:/datasource/tencentCLS/services';
// @ts-ignore
import { getTLSProject, getTLSTopic } from 'plus:/datasource/volcTLS/services';
// @ts-ignore
import { getProject as getLTSProject, getTopic as getLTSTopic } from 'plus:/datasource/huaweiLTS/services';

import { useFormNGData } from '../../context';
import { getDatasourcesByQueries } from '../DatasourceValueSelect/services';
import { buildHostMachinePreviewSummary, buildRuleConditionSummary } from './ruleConditionSummary';
import type { ConditionSummaryItem, QueryPreviewType } from './ruleConditionSummary';

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

async function enrichLogServiceQueries(cate: string | undefined, datasourceValue: number | undefined, queries: any[] | undefined): Promise<any[] | undefined> {
  if (!Array.isArray(queries) || !datasourceValue) return queries;

  if (cate === 'tencent-cls') {
    try {
      const logsets = await getCLSLogset({ cate, datasource_id: datasourceValue });
      const logsetNameMap = _.keyBy(logsets, 'LogsetId');
      return Promise.all(
        queries.map(async (query) => {
          const next = { ...query };
          if (query?.logset_id) next.logset = logsetNameMap[query.logset_id]?.LogsetName;
          if (query?.logset_id && query?.topic_id) {
            try {
              const topics = await getCLSTopic({ cate, datasource_id: datasourceValue, logset_id: query.logset_id, topic_id: query.topic_id });
              next.topic = _.find(topics, { TopicId: query.topic_id })?.TopicName;
            } catch (e) {
              return next;
            }
          }
          return next;
        }),
      );
    } catch (e) {
      return queries;
    }
  }

  if (cate === 'volc-tls') {
    try {
      const projects = await getTLSProject({ cate, datasource_id: datasourceValue });
      const projectNameMap = _.keyBy(projects, 'ProjectId');
      return Promise.all(
        queries.map(async (query) => {
          const next = { ...query };
          if (query?.project_id) next.project = projectNameMap[query.project_id]?.ProjectName;
          if (query?.project_id && query?.topic_id) {
            try {
              const topics = await getTLSTopic({ cate, datasource_id: datasourceValue, project_id: query.project_id });
              next.topic = _.find(topics, { TopicId: query.topic_id })?.TopicName;
            } catch (e) {
              return next;
            }
          }
          return next;
        }),
      );
    } catch (e) {
      return queries;
    }
  }

  if (cate === 'huawei-lts') {
    try {
      const groups = await getLTSProject({ cate, datasource_id: datasourceValue });
      const groupNameMap = _.keyBy(groups, 'id');
      return Promise.all(
        queries.map(async (query) => {
          const next = { ...query };
          if (query?.group_id) next.group = groupNameMap[query.group_id]?.name;
          if (query?.group_id && query?.stream_id) {
            try {
              const streams = await getLTSTopic({ cate, datasource_id: datasourceValue, group_id: query.group_id });
              next.stream = _.find(streams, { id: query.stream_id })?.name;
            } catch (e) {
              return next;
            }
          }
          return next;
        }),
      );
    } catch (e) {
      return queries;
    }
  }

  return queries;
}

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

function ThemeTag(props: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  const { children, className, ...rest } = props;
  const title = rest.title ?? (typeof children === 'string' || typeof children === 'number' ? String(children) : undefined);
  return (
    <span
      {...rest}
      title={title}
      className={cn(
        'inline-flex min-w-0 max-w-full items-center overflow-hidden text-ellipsis whitespace-nowrap rounded border border-primary/30 text-primary bg-primary/5 px-0.5 py-0 text-[11px]',
        className,
      )}
    >
      {children}
    </span>
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
const MAX_VISIBLE_CONDITION_ITEMS = 3;

function QueryPreviewContent(props: { value: string; type?: QueryPreviewType; vendor?: LogQLVendor; datasourceValue?: number }) {
  const { darkMode } = React.useContext(CommonStateContext);
  const theme = darkMode ? 'dark' : 'light';
  const editorClassName =
    'ant-input ant-input-disabled best-looking-scroll w-[560px] max-w-[72vw] max-h-[360px] overflow-auto !border-0 !bg-transparent !p-0 !shadow-none [&_.ant-input]:!border-0 [&_.ant-input]:!bg-transparent [&_.ant-input]:!shadow-none [&_.ant-input-disabled]:!border-0 [&_.ant-input-disabled]:!bg-transparent [&_.ant-input-disabled]:!shadow-none [&_.ant-input-affix-wrapper]:!border-0 [&_.ant-input-affix-wrapper]:!bg-transparent [&_.ant-input-affix-wrapper]:!shadow-none [&_.monaco-editor]:!outline-none';

  if (props.type === 'promql') {
    return (
      <div className={editorClassName}>
        <PromQLInputNG readOnly datasourceValue={props.datasourceValue as number} value={props.value} maxHeight={320} durationVariablesCompletion={false} />
      </div>
    );
  }
  if (props.type === 'sql') {
    return (
      <div className={editorClassName}>
        <SqlMonacoEditor
          readOnly
          className='ant-input-disabled best-looking-scroll !border-0 !bg-transparent !shadow-none'
          value={props.value}
          maxHeight={320}
          theme={theme}
          enableAutocomplete={false}
        />
      </div>
    );
  }
  if (props.type === 'loki') {
    return (
      <div className={editorClassName}>
        <LokiMonacoEditor readOnly value={props.value} theme={theme} enableAutocomplete={false} />
      </div>
    );
  }
  if (props.type === 'logql' && props.vendor) {
    return (
      <div className={editorClassName}>
        <LogQLMonacoEditor readOnly value={props.value} vendor={props.vendor} theme={theme} size='middle' />
      </div>
    );
  }
  return (
    <pre className='ant-input ant-input-disabled best-looking-scroll m-0 w-[520px] max-w-[70vw] max-h-[320px] overflow-auto whitespace-pre-wrap break-words rounded !border-0 !bg-transparent p-2 !shadow-none text-[12px] text-foreground'>
      {props.value}
    </pre>
  );
}

function QueryTextTag(props: { text?: string; fullText?: string; previewType?: QueryPreviewType; previewVendor?: LogQLVendor; datasourceValue?: number }) {
  const text = props.text || '';
  if (!text) return null;
  const fullText = props.fullText || text;

  const content = <QueryPreviewContent value={fullText} type={props.previewType} vendor={props.previewVendor} datasourceValue={props.datasourceValue} />;

  return (
    <Popover content={content} trigger='click' placement='leftTop'>
      <ThemeTag title={fullText} className='max-w-full truncate cursor-pointer hover:border-primary hover:bg-primary/10'>
        {text}
      </ThemeTag>
    </Popover>
  );
}

function SummaryMeta(props: { items: string[] }) {
  const items = props.items.filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div className='flex flex-wrap gap-1 mt-1'>
      {items.map((item) => (
        <ThemeTag key={item} className='max-w-full truncate'>
          {item}
        </ThemeTag>
      ))}
    </div>
  );
}

function SummaryList(props: { items: ConditionSummaryItem[]; datasourceValue?: number }) {
  const visibleItems = props.items.slice(0, MAX_VISIBLE_CONDITION_ITEMS);
  const extraCount = props.items.length - MAX_VISIBLE_CONDITION_ITEMS;

  return (
    <div className='space-y-2'>
      {visibleItems.map((item) => (
        <div key={item.key} className='min-w-0'>
          <div className='text-[11px] text-foreground/90 truncate'>{item.title}</div>
          <SummaryMeta items={item.meta} />
          {item.queryText && (
            <div className='mt-1 flex flex-wrap gap-1'>
              <QueryTextTag
                text={item.queryText}
                fullText={item.queryFullText}
                previewType={item.queryPreviewType}
                previewVendor={item.queryPreviewVendor}
                datasourceValue={props.datasourceValue}
              />
            </div>
          )}
          {item.valueTags && item.valueTags.length > 0 && (
            <div className='mt-1 flex flex-wrap gap-1'>
              {item.valueTags.map((value) => (
                <ThemeTag key={value} className='max-w-full truncate'>
                  {value}
                </ThemeTag>
              ))}
            </div>
          )}
        </div>
      ))}
      {extraCount > 0 && <span className='text-[11px] text-soft'>+{extraCount}</span>}
    </div>
  );
}

function HostMachinePreviewSummary(props: { queries: any[] }) {
  const { t } = useTranslation('alertRules');
  const { queries } = props;
  const { data } = useRequest(
    () =>
      getTargetList({
        p: 1,
        limit: MAX_VISIBLE_DATASOURCES,
        queries,
      }).catch(() => ({ dat: { list: [], total: 0 } })),
    {
      ready: _.isArray(queries),
      refreshDeps: [JSON.stringify(queries)],
    },
  );

  const preview = buildHostMachinePreviewSummary(data?.dat?.list || [], data?.dat?.total || 0, MAX_VISIBLE_DATASOURCES);

  if (preview.names.length === 0) return null;

  return (
    <Field>
      <FieldLabel>{t('host.query.title')}</FieldLabel>
      <div className='flex flex-wrap items-center gap-1'>
        {preview.names.map((name) => (
          <ThemeTag key={name}>{name}</ThemeTag>
        ))}
        {preview.extraCount > 0 && <span className='text-[11px] text-soft'>+{preview.extraCount}</span>}
      </div>
    </Field>
  );
}

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

// ---- 告警条件卡片 ----
function RuleConditionSummary() {
  const { t } = useTranslation('alertRules');
  const cate = Form.useWatch('cate');
  const prod = Form.useWatch('prod');
  const datasourceValueFromForm = Form.useWatch('datasource_value');
  const datasourceIds = Form.useWatch('datasource_ids');
  const datasourceQueries = Form.useWatch('datasource_queries');
  const queries = Form.useWatch(['rule_config', 'queries']);
  const triggers = Form.useWatch(['rule_config', 'triggers']);
  const version = Form.useWatch(['rule_config', 'version']);
  const nodataTrigger = Form.useWatch(['rule_config', 'nodata_trigger']);
  const datasourceValue = useMemo(() => {
    if (_.isNumber(datasourceValueFromForm)) return datasourceValueFromForm;
    const idFromDatasourceIds = _.find(datasourceIds, _.isNumber);
    if (idFromDatasourceIds !== undefined) return idFromDatasourceIds;
    return _.find(
      _.flatMap(datasourceQueries, (item: any) => item?.values || []),
      _.isNumber,
    );
  }, [datasourceValueFromForm, datasourceIds, datasourceQueries]);
  const [summaryQueries, setSummaryQueries] = useState<any[] | undefined>(queries);

  useEffect(() => {
    let ignore = false;
    setSummaryQueries(queries);
    enrichLogServiceQueries(cate, datasourceValue, queries)
      .then((nextQueries) => {
        if (!ignore) setSummaryQueries(nextQueries);
      })
      .catch(() => {
        if (!ignore) setSummaryQueries(queries);
      });
    return () => {
      ignore = true;
    };
  }, [cate, datasourceValue, queries]);

  const summary = useMemo(() => {
    return buildRuleConditionSummary({
      cate,
      queries: summaryQueries,
      triggers,
      version,
      nodataTrigger,
      labels: {
        normalMode: t('ruleConfigPromVersion_v1'),
        advancedMode: t('ruleConfigPromVersion_v2'),
        builderMode: t('datasource:es.alert.trigger.builder'),
        expressionMode: t('datasource:es.alert.trigger.code'),
        range: t('form_ng.range'),
        interval: t('form_ng.interval'),
        subqueries: t('form_ng.subqueries'),
        logGroups: t('form_ng.log_groups'),
        groupBy: t('form_ng.group_by'),
        step: t('form_ng.step'),
        fields: t('form_ng.fields'),
        nodata: t('nodata_trigger.title'),
        autoRecoverAfter: t('nodata_trigger.resolve_after'),
        seconds: t('nodata_trigger.resolve_after_unit'),
        hostThan: t('host.trigger.than'),
        hostPctTargetMissText: t('host.trigger.pct_target_miss_text'),
        hostSecond: t('host.trigger.second'),
        hostMillisecond: t('host.trigger.millisecond'),
        hostTriggerNames: {
          target_miss: t('host.trigger.key.target_miss'),
          pct_target_miss: t('host.trigger.key.pct_target_miss'),
          offset: t('host.trigger.key.offset'),
        },
      },
    });
  }, [cate, summaryQueries, triggers, version, nodataTrigger, t]);

  const hasQueries = summary.queries.length > 0;
  const hasTriggers = summary.triggers.length > 0;
  const isHost = prod === 'host' || cate === 'host';

  if (!isHost && !hasQueries && !hasTriggers) return null;

  return (
    <>
      <div>
        <SectionTitle>{t('form_ng.condition_summary')}</SectionTitle>
        {isHost && <HostMachinePreviewSummary queries={queries} />}
        {hasQueries && (
          <Field>
            <FieldLabel>{t('form_ng.query_statements')}</FieldLabel>
            <SummaryList items={summary.queries} datasourceValue={datasourceValue} />
          </Field>
        )}
        {hasTriggers && (
          <Field noMargin>
            <FieldLabel>{t('form_ng.threshold_judgment')}</FieldLabel>
            <SummaryList items={summary.triggers} />
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
              const timeLabel =
                stime && etime
                  ? (stime.format ? stime.format('HH:mm') : stime) === '00:00' && (etime.format ? etime.format('HH:mm') : etime) === '00:00'
                    ? t('form_ng.all_day')
                    : `${stime.format ? stime.format('HH:mm') : stime} ~ ${etime.format ? etime.format('HH:mm') : etime}`
                  : '';
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
      <RuleConditionSummary />
      <PipelineSummary />
      <EffectiveSummary />
      <NotifySummary />
    </>
  );
}
