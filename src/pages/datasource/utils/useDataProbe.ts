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
  metricCount?: number;
  sampleMetric?: string;
  /** 最新样本的 unix 秒（来自 timestamp()，不是求值时刻） */
  lastDataTs?: number;
  latencyMs?: number;
  errorMessage?: string;
}

/** 体检结论经 sessionStorage 传给探索器横幅（ProbeBanner），URL 只带触发位不带大对象 */
export const PROBE_STORAGE_PREFIX = 'n9e_ds_probe_';

const SAMPLE_SKIP_PREFIXES = ['go_', 'process_', 'promhttp_', 'scrape_', 'net_conntrack_'];

/** 挑示例指标：跳过运行时自监控指标，选第一个业务指标 */
export function pickSampleMetric(metrics: string[]): string | undefined {
  const preferred = _.find(metrics, (m) => m !== 'up' && !_.some(SAMPLE_SKIP_PREFIXES, (p) => _.startsWith(m, p)));
  return preferred ?? metrics[0];
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

async function probePrometheus(datasourceId: number): Promise<ProbeResult> {
  const t0 = Date.now();
  let metrics: string[] = [];
  try {
    const res = await getMetric({}, datasourceId);
    metrics = (_.get(res, 'data') as string[]) || [];
  } catch (e) {
    return { state: 'unreachable', errorMessage: _.get(e, 'message') || String(e), latencyMs: Date.now() - t0 };
  }
  if (_.isEmpty(metrics)) {
    return { state: 'noData', metricCount: 0, latencyMs: Date.now() - t0 };
  }

  const sampleMetric = pickSampleMetric(metrics)!;
  const selector = metricSelector(sampleMetric);
  try {
    // instant query 返回的样本时间戳是求值时刻，须用 timestamp() 才能得到「最近数据 X 前」
    const recent = await getQueryResult({ query: `topk(1, timestamp(${selector}))` }, datasourceId);
    const value = _.get(recent, 'data.result[0].value[1]');
    if (value != null) {
      return {
        state: 'hasData',
        metricCount: metrics.length,
        sampleMetric,
        lastDataTs: _.toNumber(value),
        latencyMs: Date.now() - t0,
      };
    }
    // 5min lookback 内无样本 → 放宽到 24h，区分「断流」与「从未有过」
    const seen = await getQueryResult({ query: `present_over_time(${selector}[24h])` }, datasourceId);
    const stale = !_.isEmpty(_.get(seen, 'data.result'));
    return { state: stale ? 'staleData' : 'noData', metricCount: metrics.length, sampleMetric, latencyMs: Date.now() - t0 };
  } catch (e) {
    // 元数据可读但查询失败：按不可达处理并透出错误
    return { state: 'unreachable', metricCount: metrics.length, errorMessage: _.get(e, 'message') || String(e), latencyMs: Date.now() - t0 };
  }
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
