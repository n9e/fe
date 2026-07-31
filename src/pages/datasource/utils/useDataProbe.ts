import { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';

import { getMetric, getQueryResult } from '@/services/dashboardV2';

import { markDsJourney } from './journey';

/**
 * 数据体检（产品方案 A1.5/A1.6）：保存结果弹窗打开即自动执行。
 * 回答三个问题：连得上吗 → 有指标吗 → 最近还有新数据吗。
 * 一期仅 Prometheus 系；其余类型返回 unsupported，调用方降级为只展示保存态与下一步动作。
 */

export type ProbeState = 'probing' | 'hasData' | 'staleData' | 'noData' | 'unreachable' | 'unsupported';

export interface ProbeResult {
  state: ProbeState;
  /** 探测窗口内有数据的指标名数量（hasData 时为近 5 分钟，staleData 时为近 24 小时） */
  metricCount?: number;
  sampleMetric?: string;
  /** 最新样本的 unix 秒（来自 timestamp()，不是求值时刻） */
  lastDataTs?: number;
  latencyMs?: number;
  errorMessage?: string;
}

/** 体检结论经 sessionStorage 传给探索器横幅（ProbeBanner），URL 只带触发位不带大对象 */
export const PROBE_STORAGE_PREFIX = 'n9e_ds_probe_';

/** 「有新数据」的窗口，与 Prometheus 默认 lookback delta 对齐 */
const FRESH_WINDOW_SECONDS = 5 * 60;
/** 「有过数据」的窗口，用于区分「断流」与「从未有过」 */
const SEEN_WINDOW_SECONDS = 24 * 60 * 60;

const SAMPLE_SKIP_PREFIXES = ['go_', 'process_', 'promhttp_', 'scrape_', 'net_conntrack_'];

/** 实测最新样本时间时并发探测的候选指标个数；取多个是为了不让个别僵尸指标否掉整个数据源 */
const SAMPLE_CANDIDATE_LIMIT = 3;

/** 挑若干示例指标：优先业务指标，全是自监控指标时退回原列表 */
export function pickSampleMetrics(metrics: string[], limit = SAMPLE_CANDIDATE_LIMIT): string[] {
  const preferred = _.filter(metrics, (m) => m !== 'up' && !_.some(SAMPLE_SKIP_PREFIXES, (p) => _.startsWith(m, p)));
  return _.take(_.isEmpty(preferred) ? metrics : preferred, limit);
}

/** 挑示例指标：跳过运行时自监控指标，选第一个业务指标 */
export function pickSampleMetric(metrics: string[]): string | undefined {
  return pickSampleMetrics(metrics, 1)[0];
}

/**
 * 指标名转 PromQL 选择器。
 * __name__ 的取值可以是任意字符串（OTel 直写、relabel 改写会产出 system.cpu.utilization 这类名字），
 * 裸写进 PromQL 会是语法错误，选择器形式对任意指标名都安全。
 * JSON.stringify 的转义规则与 PromQL 字符串字面量兼容。
 */
export function metricSelector(metric: string): string {
  return `{__name__=${JSON.stringify(metric)}}`;
}

/**
 * 拉取某个时间窗内「有数据」的指标名。
 * 必须带 start/end：label values 接口不带时间范围时返回的是整个 retention 期内出现过的全部指标名，
 * 拿它做新鲜度判断会把早已下线的僵尸指标一并算进来（仓库其余三处调用同样传时间窗）。
 */
async function getMetricsInWindow(datasourceId: number, windowSeconds: number): Promise<string[]> {
  const end = Math.floor(Date.now() / 1000);
  const res = await getMetric({ start: end - windowSeconds, end }, datasourceId);
  return (_.get(res, 'data') as string[]) || [];
}

/**
 * 并发实测若干候选指标的最新样本时间，取其中最大值。
 * 取多个而非一个：个别指标来自已下线的采集目标是常态，不能让它否掉整个数据源的结论。
 * 全部请求都失败时 allFailed 为真，调用方按「元数据可读但查询失败」处理。
 */
async function queryLastDataTs(datasourceId: number, candidates: string[]): Promise<{ ts?: number; sampleMetric?: string; allFailed: boolean; errorMessage?: string }> {
  // instant query 返回的样本时间戳是求值时刻，须用 timestamp() 才能得到「最近数据 X 前」
  const settled = await Promise.all(
    _.map(candidates, (metric) =>
      getQueryResult({ query: `topk(1, timestamp(${metricSelector(metric)}))` }, datasourceId)
        .then((res) => {
          const value = _.get(res, 'data.result[0].value[1]');
          return { metric, ts: value == null ? undefined : _.toNumber(value), errorMessage: undefined as string | undefined };
        })
        .catch((e) => ({ metric, ts: undefined, errorMessage: _.get(e, 'message') || String(e) })),
    ),
  );

  const failed = _.filter(settled, (r) => r.errorMessage !== undefined);
  if (!_.isEmpty(candidates) && failed.length === settled.length) {
    return { allFailed: true, errorMessage: failed[0].errorMessage };
  }

  const newest = _.maxBy(
    _.filter(settled, (r) => r.ts !== undefined),
    'ts',
  );
  return { ts: newest?.ts, sampleMetric: newest?.metric, allFailed: false };
}

export async function probePrometheus(datasourceId: number): Promise<ProbeResult> {
  const t0 = Date.now();

  let freshMetrics: string[] = [];
  try {
    freshMetrics = await getMetricsInWindow(datasourceId, FRESH_WINDOW_SECONDS);
  } catch (e) {
    return { state: 'unreachable', errorMessage: _.get(e, 'message') || String(e), latencyMs: Date.now() - t0 };
  }

  if (_.isEmpty(freshMetrics)) {
    // 近 5 分钟窗口内一个指标名都没有 → 放宽到 24h，区分「断流」与「从未有过」
    let seenMetrics: string[] = [];
    try {
      seenMetrics = await getMetricsInWindow(datasourceId, SEEN_WINDOW_SECONDS);
    } catch (e) {
      return { state: 'unreachable', errorMessage: _.get(e, 'message') || String(e), latencyMs: Date.now() - t0 };
    }
    return {
      state: _.isEmpty(seenMetrics) ? 'noData' : 'staleData',
      metricCount: seenMetrics.length,
      sampleMetric: pickSampleMetric(seenMetrics),
      latencyMs: Date.now() - t0,
    };
  }

  // label values 接口的 start/end 会被 Prometheus 对齐到 block 边界（head block 常跨数小时），
  // 所以「窗口内出现过的指标名」只够说明近期有过数据，不足以断言此刻还在写。
  // 用多个候选指标实测一次最新样本时间来定这一刀。
  const probed = await queryLastDataTs(datasourceId, pickSampleMetrics(freshMetrics));
  if (probed.allFailed) {
    // 元数据可读但查询失败：按不可达处理并透出错误
    return { state: 'unreachable', metricCount: freshMetrics.length, errorMessage: probed.errorMessage, latencyMs: Date.now() - t0 };
  }
  if (probed.ts === undefined) {
    // 候选指标全都没有近期样本 → 已断流；指标名还在说明 24h 内有过数据，不必再查一次
    return { state: 'staleData', metricCount: freshMetrics.length, sampleMetric: pickSampleMetric(freshMetrics), latencyMs: Date.now() - t0 };
  }
  // hasData 必然带得出 lastDataTs，文案里不会出现「最近数据 -」
  return {
    state: 'hasData',
    metricCount: freshMetrics.length,
    sampleMetric: probed.sampleMetric,
    lastDataTs: probed.ts,
    latencyMs: Date.now() - t0,
  };
}

export default function useDataProbe(datasourceId: number | undefined, pluginType: string | undefined) {
  const [probe, setProbe] = useState<ProbeResult>({ state: 'probing' });
  const seq = useRef(0);
  // 宿主是弹窗，用户可能在 1.5s 重试窗口内关掉；seq 只挡竞态，挡不住卸载后 setState
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(() => {
    if (!datasourceId || !pluginType) return;
    if (pluginType !== 'prometheus') {
      setProbe({ state: 'unsupported' });
      return;
    }
    const mySeq = ++seq.current;
    setProbe({ state: 'probing' });
    // 刚保存的数据源可能还没被查询侧缓存加载（后端 upsert 已主动 SyncOnce，
    // 但 Prometheus 客户端有约 1 秒的重建窗口），首次不可达时自动重试一次再下结论
    probePrometheus(datasourceId)
      .then((r) => {
        if (r.state !== 'unreachable') return r;
        return new Promise<ProbeResult>((resolve) => {
          setTimeout(() => resolve(probePrometheus(datasourceId)), 1500);
        });
      })
      .then((r) => {
        if (seq.current !== mySeq || !mounted.current) return;
        setProbe(r);
        if (r.state === 'hasData') {
          markDsJourney(datasourceId, 'verified_at');
        }
        try {
          sessionStorage.setItem(`${PROBE_STORAGE_PREFIX}${datasourceId}`, JSON.stringify(r));
        } catch (e) {
          // sessionStorage 不可用时静默降级，仅影响探索器横幅
        }
      });
  }, [datasourceId, pluginType]);

  useEffect(() => {
    run();
  }, [run]);

  return { probe, reprobe: run };
}
