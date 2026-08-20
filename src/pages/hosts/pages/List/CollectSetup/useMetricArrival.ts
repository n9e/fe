import { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';

import { getPromData } from '@/components/PromGraphCpt/services';
import { N9E_PATHNAME } from '@/utils/constant';

import { buildArrivalPromql } from './buildArrivalPromql';

export type MetricArrivalStatus = 'baselining' | 'waiting' | 'detected' | 'timeout';

export interface ArrivalDatasource {
  id: number;
  name: string;
}

const POLL_INTERVAL = 5000;
const DEFAULT_POLL_TIMEOUT = 5 * 60 * 1000;
/** 精确指标连续查空多少轮后，发一次前缀对照查询看是不是指标名登记错了 */
const FALLBACK_PROBE_ROUNDS = 3;

interface Options {
  /** 进入验证步骤才开始轮询 */
  active: boolean;
  /** 待探测的数据源集合（服务端下发的默认值，或用户在验证步骤手动切换后的选择） */
  datasources: ArrivalDatasource[];
  /** 指标名前缀，如 mysql；调用方保证非空 */
  metricPrefix: string;
  /**
   * 代表性指标精确名（如 mysql_up）。有值时用精确匹配查询，避免 __name__
   * 前缀正则展开该组件全部序列（mysql 一台实例就是几百条）；未定义回退前缀正则
   */
  metric?: string;
  /**
   * 用户声明将执行命令的目标机器。非空时进入"逐台确认"模式：查询按 ident
   * 收窄，所选机器全部上报即成功——包括开始检测前就已在上报的机器（修改
   * 配置场景），由 preexistingIdents 区分标注。为空时退化为通用模式：
   * 观察是否出现基线外的新 ident。
   */
  idents?: string[];
  /**
   * 等多久算超时。默认 5 分钟够用于「用户刚在机器上执行完命令」；
   * 中心端下发要等 agent 先拉到配置再跑一轮采集（reload_interval 默认 120 秒），
   * 沿用 5 分钟很容易把还在路上的判成失败，调用方按场景放宽。
   */
  timeout?: number;
}

/**
 * 并行轮询候选数据源，观察「上报 <prefix>_ 开头指标的 ident 集合」。
 * 基线按数据源分别维护：某个数据源首次查询成功的结果即其基线，查询失败的
 * 数据源不建基线、下一轮重试——避免瞬断后把存量机器误判成新增。
 */
export default function useMetricArrival(options: Options) {
  const { active, datasources, metricPrefix, metric, idents, timeout = DEFAULT_POLL_TIMEOUT } = options;
  const [status, setStatus] = useState<MetricArrivalStatus>('baselining');
  const [newIdents, setNewIdents] = useState<string[]>([]);
  const [reportingIdents, setReportingIdents] = useState<string[]>([]);
  /** 逐台确认模式下：所选机器中已经上报的 */
  const [arrivedIdents, setArrivedIdents] = useState<string[]>([]);
  /** 逐台确认模式下：所选机器中尚未上报的 */
  const [missingIdents, setMissingIdents] = useState<string[]>([]);
  /** 逐台确认模式下：开始检测前就已在上报的（修改配置场景） */
  const [preexistingIdents, setPreexistingIdents] = useState<string[]>([]);
  const [hitDatasourceNames, setHitDatasourceNames] = useState<string[]>([]);
  /**
   * 精确哨兵指标连续数轮查空后自动降级为前缀匹配的标记，UI 据此标注「按前缀匹配」。
   * 背景：catalog 登记的精确指标名可能与部署实际对不上（真机已抓到 Ping 一例），
   * 降级让错误的登记只损失精确性，不把整场验证拖到超时。
   */
  const [fallbackToPrefix, setFallbackToPrefix] = useState(false);
  const [round, setRound] = useState(0);

  // 数组入参每次渲染都是新引用，effect 依赖用稳定 key，轮询内部经 ref 取最新值
  const datasourcesRef = useRef(datasources);
  datasourcesRef.current = datasources;
  const datasourceKey = useMemo(() => _.map(datasources, 'id').join(','), [datasources]);
  const identsRef = useRef(idents);
  identsRef.current = idents;
  const identsKey = useMemo(() => _.join(idents ?? [], ','), [idents]);

  useEffect(() => {
    if (!active || datasourcesRef.current.length === 0) return;
    // 停止标志必须是 effect 内的局部变量：用 ref 的话，cleanup 置 true 后新一轮
    // effect 又会把它置回 false，旧一轮飞行中的 Promise.all 落地时就会被"复活"，
    // 用旧 promql 的结果改状态并另起一条 setTimeout 链，形成并行失控的双轮询。
    // 用户切换数据源 / 目标机器 / 点重试都会让 effect 重跑，触发面并不窄。
    let stopped = false;
    // 基线按数据源 id 分别维护
    const baselines = new Map<number, Set<string>>();
    setStatus('baselining');
    setNewIdents([]);
    setReportingIdents([]);
    setArrivedIdents([]);
    setMissingIdents(identsRef.current ?? []);
    setPreexistingIdents([]);
    setHitDatasourceNames([]);

    const startedAt = Date.now();
    const selected = _.compact(identsRef.current ?? []);
    // 降级只发生在逐台确认模式：通用模式靠「基线外新增」判成功，切换指标会把
    // 存量机器全部算成新增，直接制造假阳性；逐台模式的成功条件是「所选机器里有在上报的」，
    // 换成前缀匹配语义不变，只是失去区分存量的精度（由 fallbackToPrefix 让 UI 如实标注）。
    let useFallback = false;
    /** 精确指标连续查空的轮数：攒够了才发一次前缀对照查询，不必每轮都多打一条 */
    let exactEmptyRounds = 0;
    setFallbackToPrefix(false);
    const buildQuery = (prefixOnly?: boolean) =>
      buildArrivalPromql({ metricPrefix, metric: prefixOnly || useFallback ? undefined : metric, idents: selected });

    const queryIdents = (datasourceId: number, promql: string): Promise<string[] | null> =>
      getPromData(`/api/${N9E_PATHNAME}/proxy/${datasourceId}/api/v1/query`, {
        time: moment().unix(),
        query: promql,
      })
        .then((data) => {
          const result = _.get(data, 'result', []);
          return _.uniq(_.compact(_.map(result, (item) => _.get(item, ['metric', 'ident'])))) as string[];
        })
        .catch((err) => {
          console.error('probe metric arrival failed, datasource:', datasourceId, err);
          return null; // 单个数据源失败不建基线、不判失败，下一轮重试
        });

    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const list = datasourcesRef.current;
      let results = await Promise.all(_.map(list, (ds) => queryIdents(ds.id, buildQuery())));
      if (stopped) return;

      // 精确哨兵指标登记错了的自愈降级。
      //
      // 判据必须是「前缀查得到、精确查不到」：只看「精确查不到」区分不了两种原因 ——
      // catalog 把指标名登记错了，和数据本来就还没到。后者才是常态（用户刚执行完命令、
      // 中心端下发要等 agent 两轮拉取），而 tick 是立即起跑 + 5 秒一轮，三轮才 10 秒，
      // 按轮数降级等于每一次正常验证都会降，verifyMetric 的精度形同虚设。
      // 所以连续查空只作为「值得发一次对照查询」的触发条件，降不降由对照结果说了算。
      if (metric && !useFallback && selected.length > 0) {
        const anySuccess = _.some(results, (r) => r !== null);
        const anySeries = _.some(results, (r) => r !== null && r.length > 0);
        if (anySeries) {
          exactEmptyRounds = 0;
        } else if (anySuccess && (exactEmptyRounds += 1) >= FALLBACK_PROBE_ROUNDS) {
          exactEmptyRounds = 0; // 没证实就重新攒，下一个窗口再探，避免每轮都多发一条
          const probe = await Promise.all(_.map(list, (ds) => queryIdents(ds.id, buildQuery(true))));
          if (stopped) return;
          if (_.some(probe, (r) => r !== null && r.length > 0)) {
            useFallback = true;
            setFallbackToPrefix(true);
            // 对照查询本轮就有数据，直接当作本轮结果用，不必再空等一个轮询间隔
            results = probe;
          }
        }
      }

      const allIdents = new Set<string>();
      const freshIdents = new Set<string>();
      const freshDsNames = new Set<string>();
      const roundDsNames = new Set<string>();
      results.forEach((resultIdents, index) => {
        if (resultIdents === null) return;
        const ds = list[index];
        resultIdents.forEach((ident) => allIdents.add(ident));
        if (resultIdents.length > 0) roundDsNames.add(ds.name);
        const baseline = baselines.get(ds.id);
        if (!baseline) {
          baselines.set(ds.id, new Set(resultIdents));
          return; // 首次成功即基线，不参与"新增"判定
        }
        resultIdents.forEach((ident) => {
          if (!baseline.has(ident)) {
            freshIdents.add(ident);
            freshDsNames.add(ds.name);
          }
        });
      });

      setReportingIdents(Array.from(allIdents));
      const baselineUnion = new Set<string>();
      baselines.forEach((set) => set.forEach((ident) => baselineUnion.add(ident)));

      if (selected.length > 0) {
        // 逐台确认：**有一台上报就算成功**，不必等齐。
        //
        // 从前要求全部到达，但「命中的机器里有几台压根没装 agent / 配置没下发」是常态，
        // 等齐往往等不到，只能耗满超时——而那时数据其实早就通了。改成有一台即出结论，
        // 把「还差哪几台」如实列在 missingIdents 里交给 UI 说明，比卡着不给结论有用。
        //
        // 这条判据成立的前提是查询已按 selected 收窄（见 buildArrivalPromql），
        // 查到的 ident 一定是本次的目标机器，不会拿不相干机器的数据冒充成功。
        const arrived = selected.filter((ident) => allIdents.has(ident));
        const missing = selected.filter((ident) => !allIdents.has(ident));
        setArrivedIdents(arrived);
        setMissingIdents(missing);
        setPreexistingIdents(selected.filter((ident) => baselineUnion.has(ident)));
        if (arrived.length > 0 && baselines.size > 0) {
          setNewIdents(selected.filter((ident) => !baselineUnion.has(ident) && allIdents.has(ident)));
          setHitDatasourceNames(Array.from(roundDsNames));
          setStatus('detected');
          // 已出结论但还有机器没上报时不停轮询：让计数继续往上走，用户能看到 1/3 → 3/3。
          // 全部到齐或超时才收手；已 detected 的不再回退成 timeout。
          if (missing.length === 0 || Date.now() - startedAt >= timeout) return;
          timer = setTimeout(tick, POLL_INTERVAL);
          return;
        }
      } else if (freshIdents.size > 0) {
        // 通用模式（调用方没给目标机器）：查询没有收窄，只能靠「出现基线外的新 ident」
        // 判定——此时「有数据」证明不了是这次配置的功劳，可能是同组件别的机器本来就在报。
        setNewIdents(Array.from(freshIdents));
        setHitDatasourceNames(Array.from(freshDsNames));
        setStatus('detected');
        return;
      }

      if (baselines.size > 0) setStatus('waiting');
      if (Date.now() - startedAt >= timeout) {
        setStatus('timeout');
        return;
      }
      timer = setTimeout(tick, POLL_INTERVAL);
    };
    tick();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [active, datasourceKey, identsKey, metricPrefix, metric, round, timeout]);

  return {
    status,
    newIdents,
    reportingIdents,
    arrivedIdents,
    missingIdents,
    preexistingIdents,
    hitDatasourceNames,
    fallbackToPrefix,
    restart: () => setRound((r) => r + 1),
  };
}
