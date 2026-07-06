// @ts-expect-error moment uses export =; tsc file-arg mode ignores tsconfig's esModuleInterop, but esbuild handles it at runtime
import moment from 'moment';

type RelativeTimeRange = {
  start: number;
  end: number;
  cumulative_window_from?: string;
  cumulative_window_to?: string;
};

type TimeOption = {
  start: string;
  end: string;
  display?: string;
};

const relativeRegex = /^now$|^now\-(\d{1,10})([wdhms])$/;
const units: Record<string, number> = {
  w: 604800,
  d: 86400,
  h: 3600,
  m: 60,
  s: 1,
};

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function relativeToSeconds(relative: string): number {
  const match = relativeRegex.exec(relative);
  if (!match || match.length !== 3) return 0;
  const [, value, unit] = match;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed * units[unit];
}

function secondsToRelativeFormat(seconds: number): string {
  if (seconds <= 0) return 'now';
  if (seconds >= units.w && seconds % units.w === 0) return `now-${seconds / units.w}w`;
  if (seconds >= units.d && seconds % units.d === 0) return `now-${seconds / units.d}d`;
  if (seconds >= units.h && seconds % units.h === 0) return `now-${seconds / units.h}h`;
  if (seconds >= units.m && seconds % units.m === 0) return `now-${seconds / units.m}m`;
  return `now-${seconds}s`;
}

function mapRelativeTimeRangeToOption(range: RelativeTimeRange): TimeOption {
  if (range.cumulative_window_from && range.cumulative_window_to) {
    return {
      start: range.cumulative_window_from,
      end: range.cumulative_window_to,
      display: `${range.cumulative_window_from} to ${range.cumulative_window_to}`,
    };
  }
  const start = secondsToRelativeFormat(range.start);
  const end = secondsToRelativeFormat(range.end);
  return { start, end, display: `${start} to ${end}` };
}

function mapOptionToRelativeTimeRange(option?: TimeOption): RelativeTimeRange | undefined {
  if (!option) return undefined;
  if (option.start === 'now/d' && option.end === 'now/d') {
    return {
      start: 0,
      end: 0,
      cumulative_window_from: option.start,
      cumulative_window_to: option.end,
    };
  }
  return {
    start: relativeToSeconds(option.start),
    end: relativeToSeconds(option.end),
  };
}

function parseTimeToValueAndUnit(value?: number) {
  if (!value) return { value, unit: 'min' };
  if (value < 60) return { value, unit: 'second' };
  const minutes = value / 60;
  if (minutes < 60) return { value: minutes, unit: 'min' };
  return { value: minutes / 60, unit: 'hour' };
}

function normalizeTime(value?: number, unit?: 'second' | 'min' | 'hour') {
  if (!value) return value;
  if (unit === 'second') return value;
  if (unit === 'min') return value * 60;
  if (unit === 'hour') return value * 60 * 60;
  return value;
}

function splitKeyList(value: unknown) {
  if (value === undefined) return value;
  return value ? String(value).split(' ') : [];
}

function joinKeyList(value: unknown) {
  return Array.isArray(value) ? value.map(String).join(' ') : value;
}

function stringifyExpressions(expressions: any[] = []) {
  const logicalOperator = expressions[0]?.logicalOperator;
  return expressions
    .map((expression, index) => {
      const prefix = index === 0 ? '' : ` ${logicalOperator} `;
      return `${prefix}$${expression.ref}${expression.label ? `.${expression.label}` : ''} ${expression.comparisonOperator} ${expression.value}`;
    })
    .join('');
}

function normalizeQueryInitialValues(query: Record<string, any>) {
  const next = { ...query };
  if (next.keys) {
    next.keys = { ...next.keys };
    if (next.keys.labelKey !== undefined) next.keys.labelKey = splitKeyList(next.keys.labelKey);
    if (next.keys.valueKey !== undefined) next.keys.valueKey = splitKeyList(next.keys.valueKey);
    if (next.keys.metricKey !== undefined) next.keys.metricKey = splitKeyList(next.keys.metricKey);
  }
  delete next.from;
  delete next.to;
  return {
    ...next,
    interval: query.interval ? parseTimeToValueAndUnit(query.interval).value : undefined,
    interval_unit: query.interval ? parseTimeToValueAndUnit(query.interval).unit : undefined,
    range:
      query.from !== undefined && query.to !== undefined
        ? mapRelativeTimeRangeToOption({
            start: Number(query.from),
            end: Number(query.to),
            cumulative_window_from: query.cumulative_window_from,
            cumulative_window_to: query.cumulative_window_to,
          })
        : undefined,
  };
}

function normalizeQueryFormValues(query: Record<string, any>) {
  const next = { ...query };
  if (next.keys) {
    next.keys = { ...next.keys };
    if (Array.isArray(next.keys.labelKey)) next.keys.labelKey = joinKeyList(next.keys.labelKey);
    if (Array.isArray(next.keys.valueKey)) next.keys.valueKey = joinKeyList(next.keys.valueKey);
    if (Array.isArray(next.keys.metricKey)) next.keys.metricKey = joinKeyList(next.keys.metricKey);
  }
  const parsedRange = mapOptionToRelativeTimeRange(next.range);
  delete next.interval_unit;
  delete next.range;
  return {
    ...next,
    interval: query.interval_unit ? normalizeTime(query.interval, query.interval_unit) : undefined,
    from: parsedRange?.start,
    to: parsedRange?.end,
    cumulative_window_from: parsedRange?.cumulative_window_from,
    cumulative_window_to: parsedRange?.cumulative_window_to,
  };
}

function defaultEffectiveTime() {
  return [
    {
      enable_stime: moment('00:00', 'HH:mm'),
      enable_etime: moment('00:00', 'HH:mm'),
      enable_days_of_week: ['0', '1', '2', '3', '4', '5', '6'],
    },
  ];
}

export function processAlertRuleInitialValuesForE2E(rawValues: Record<string, any>): Record<string, any> {
  const values = cloneJson(rawValues);
  if (Array.isArray(values.rule_config?.queries)) {
    values.rule_config.queries = values.rule_config.queries.map(normalizeQueryInitialValues);
  }

  const extraConfig = isRecord(values.extra_config) ? values.extra_config : {};
  const enrichQueries = Array.isArray(extraConfig.enrich_queries) ? extraConfig.enrich_queries.map(normalizeQueryInitialValues) : [];

  return {
    ...values,
    enable_in_bg: values.enable_in_bg === 1,
    enable_status: values.disabled === undefined ? true : !values.disabled,
    notify_recovered: values.notify_recovered === 1 || values.notify_recovered === undefined,
    callbacks: Array.isArray(values.callbacks) && values.callbacks.length > 0 ? values.callbacks.map((url) => ({ url })) : undefined,
    effective_time: Array.isArray(values.enable_etimes)
      ? values.enable_etimes.map((etime: string, index: number) => ({
          enable_stime: moment(values.enable_stimes[index], 'HH:mm'),
          enable_etime: moment(etime, 'HH:mm'),
          enable_days_of_week: values.enable_days_of_weeks[index],
        }))
      : defaultEffectiveTime(),
    annotations: isRecord(values.annotations) ? Object.entries(values.annotations).map(([key, value]) => ({ key, value })) : [],
    extra_config: {
      ...extraConfig,
      service_cal_configs: Array.isArray(extraConfig.service_cal_configs)
        ? extraConfig.service_cal_configs.map((item: any) => ({
            service_cal_ids: item.service_cal_ids,
            time_range: {
              start: item.time_range?.start ? moment(item.time_range.start, 'HH:mm') : undefined,
              end: item.time_range?.end ? moment(item.time_range.end, 'HH:mm') : undefined,
            },
          }))
        : [],
      enrich_queries: enrichQueries,
    },
    pipeline_configs: values.pipeline_configs ?? [{ enable: true }],
  };
}

export function processAlertRuleFormValuesForE2E(rawValues: Record<string, any>): Record<string, any> {
  const values = { ...rawValues };
  let cate = values.cate;
  if (values.prod === 'host') cate = 'host';
  if (values.prod === 'anomaly') cate = 'prometheus';

  if (values.cate === 'prometheus' && values.rule_config?.version === 'v2') {
    values.rule_config = {
      ...values.rule_config,
      queries: (values.rule_config.queries || []).map((item: Record<string, any>) => {
        const { prom_ql, ...rest } = item;
        return rest;
      }),
    };
  }

  if (Array.isArray(values.rule_config?.queries)) {
    values.rule_config = {
      ...values.rule_config,
      queries: values.rule_config.queries.map(normalizeQueryFormValues),
    };
  }

  if (Array.isArray(values.rule_config?.triggers)) {
    values.rule_config = {
      ...values.rule_config,
      triggers: values.rule_config.triggers.map((trigger: Record<string, any>) => {
        if (trigger.mode === 0) {
          return {
            ...trigger,
            exp: stringifyExpressions(trigger.expressions),
          };
        }
        if (trigger.mode === 1) {
          return {
            ...trigger,
            expressions: [{ ref: 'A', comparisonOperator: '>' }],
          };
        }
        return trigger;
      }),
    };
  }

  const extraConfig = isRecord(values.extra_config) ? values.extra_config : {};
  const enrichQueries = Array.isArray(extraConfig.enrich_queries) ? extraConfig.enrich_queries.map(normalizeQueryFormValues) : [];
  const effectiveTime = Array.isArray(values.effective_time) ? values.effective_time : defaultEffectiveTime();
  const { effective_time, ...valuesWithoutEffectiveTime } = values;

  return {
    ...valuesWithoutEffectiveTime,
    cate,
    enable_days_of_weeks: effectiveTime.map((item) => item.enable_days_of_week),
    enable_stimes: effectiveTime.map((item) => item.enable_stime.format('HH:mm')),
    enable_etimes: effectiveTime.map((item) => item.enable_etime.format('HH:mm')),
    disabled: values.enable_status ? 0 : 1,
    notify_recovered: values.notify_recovered ? 1 : 0,
    enable_in_bg: values.enable_in_bg ? 1 : 0,
    callbacks: Array.isArray(values.callbacks) ? values.callbacks.map((item) => item.url) : [],
    annotations: Array.isArray(values.annotations)
      ? values.annotations.reduce((acc: Record<string, unknown>, item: Record<string, unknown>) => {
          acc[String(item.key)] = item.value;
          return acc;
        }, {})
      : {},
    extra_config: {
      ...extraConfig,
      service_cal_configs: Array.isArray(extraConfig.service_cal_configs)
        ? extraConfig.service_cal_configs.map((item: any) => ({
            service_cal_ids: item.service_cal_ids,
            time_range: {
              start: item.time_range?.start?.format('HH:mm'),
              end: item.time_range?.end?.format('HH:mm'),
            },
          }))
        : [],
      enrich_queries: enrichQueries,
    },
  };
}
