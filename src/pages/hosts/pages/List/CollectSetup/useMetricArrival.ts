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
const POLL_TIMEOUT = 5 * 60 * 1000;

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
}

/**
 * 并行轮询候选数据源，观察「上报 <prefix>_ 开头指标的 ident 集合」。
 * 基线按数据源分别维护：某个数据源首次查询成功的结果即其基线，查询失败的
 * 数据源不建基线、下一轮重试——避免瞬断后把存量机器误判成新增。
 */
export default function useMetricArrival(options: Options) {
  const { active, datasources, metricPrefix, metric, idents } = options;
  const [status, setStatus] = useState<MetricArrivalStatus>('baselining');
  const [newIdents, setNewIdents] = useState<string[]>([]);
  const [reportingIdents, setReportingIdents] = useState<string[]>([]);
  /** 逐台确认模式下：所选机器中尚未上报的 */
  const [missingIdents, setMissingIdents] = useState<string[]>([]);
  /** 逐台确认模式下：开始检测前就已在上报的（修改配置场景） */
  const [preexistingIdents, setPreexistingIdents] = useState<string[]>([]);
  const [hitDatasourceNames, setHitDatasourceNames] = useState<string[]>([]);
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
    setMissingIdents(identsRef.current ?? []);
    setPreexistingIdents([]);
    setHitDatasourceNames([]);

    const startedAt = Date.now();
    const selected = _.compact(identsRef.current ?? []);
    const promql = buildArrivalPromql({ metricPrefix, metric, idents: selected });

    const queryIdents = (datasourceId: number): Promise<string[] | null> =>
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
      const results = await Promise.all(_.map(list, (ds) => queryIdents(ds.id)));
      if (stopped) return;

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
        // 逐台确认：所选机器全部上报即成功（含检测前已在上报的，单独标注）
        const missing = selected.filter((ident) => !allIdents.has(ident));
        setMissingIdents(missing);
        setPreexistingIdents(selected.filter((ident) => baselineUnion.has(ident)));
        if (missing.length === 0 && baselines.size > 0) {
          setNewIdents(selected.filter((ident) => !baselineUnion.has(ident)));
          setHitDatasourceNames(Array.from(roundDsNames));
          setStatus('detected');
          return;
        }
      } else if (freshIdents.size > 0) {
        // 通用模式：出现基线外的新 ident 即成功
        setNewIdents(Array.from(freshIdents));
        setHitDatasourceNames(Array.from(freshDsNames));
        setStatus('detected');
        return;
      }

      if (baselines.size > 0) setStatus('waiting');
      if (Date.now() - startedAt >= POLL_TIMEOUT) {
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
  }, [active, datasourceKey, identsKey, metricPrefix, metric, round]);

  return { status, newIdents, reportingIdents, missingIdents, preexistingIdents, hitDatasourceNames, restart: () => setRound((r) => r + 1) };
}
