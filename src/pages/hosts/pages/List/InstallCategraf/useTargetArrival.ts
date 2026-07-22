import { useCallback, useEffect, useRef, useState } from 'react';
import { useInterval } from 'ahooks';
import _ from 'lodash';

import { probeTargets } from '../../../services';

const POLL_INTERVAL = 5000;
const POLL_TIMEOUT = 10 * 60 * 1000;

export type ArrivalStatus = 'baselining' | 'waiting' | 'detected' | 'timeout';

/**
 * 轮询确认「有新机器上报」。
 *
 * 判据用总数而非首页 ident 差集：列表默认按 ident 排序，新机器不一定落在第一页。
 * 未归组机器的 ident 集合只用于把机器名展示给用户，取不到就退化成通用文案。
 */
export default function useTargetArrival() {
  const [status, setStatus] = useState<ArrivalStatus>('baselining');
  const [newIdents, setNewIdents] = useState<string[]>([]);
  const baselineRef = useRef<{ total: number; ungrouped: Set<string> } | null>(null);
  const startedAtRef = useRef(0);

  /**
   * 建立基线。探测失败返回 false 且不写入基线 —— 失败绝不能当成「0 台」，
   * 否则下一轮会把存量机器全部误判成新上报，给用户一个假的成功信号。
   */
  const captureBaseline = useCallback(async () => {
    const [all, ungrouped] = await Promise.all([probeTargets(), probeTargets({ gids: '0', limit: 100 })]);
    if (!all) return false;
    baselineRef.current = {
      total: all.total,
      ungrouped: new Set(_.map(ungrouped?.list ?? [], 'ident')),
    };
    return true;
  }, []);

  const start = useCallback(() => {
    baselineRef.current = null;
    setNewIdents([]);
    setStatus('baselining');
    startedAtRef.current = Date.now();
    captureBaseline().then((ok) => {
      if (ok) setStatus('waiting');
    });
  }, [captureBaseline]);

  useEffect(() => {
    start();
  }, [start]);

  useInterval(
    () => {
      if (Date.now() - startedAtRef.current > POLL_TIMEOUT) {
        setStatus('timeout');
        return;
      }
      const baseline = baselineRef.current;
      if (!baseline) {
        // 首次探测失败，先把基线补建起来，期间不做任何「新机器」判断
        captureBaseline().then((ok) => {
          if (ok) setStatus('waiting');
        });
        return;
      }
      probeTargets().then((all) => {
        if (!all) return; // 单次失败忽略，等下一轮
        if (all.total <= baseline.total) {
          // 期间有机器被删除，下调基线，否则后续新增会被这个差值吃掉
          baseline.total = all.total;
          return;
        }
        setStatus('detected');
        probeTargets({ gids: '0', limit: 100 }).then((ungrouped) => {
          if (!ungrouped) return;
          setNewIdents(_.filter(_.map(ungrouped.list, 'ident'), (ident) => !baseline.ungrouped.has(ident)));
        });
      });
    },
    // undefined 时 ahooks 停表；基线未建立时也要继续轮询，否则一次探测失败就永久卡住。
    // 组件卸载由 ahooks 自动清理
    status === 'baselining' || status === 'waiting' ? POLL_INTERVAL : undefined,
  );

  return { status, newIdents, restart: start };
}
