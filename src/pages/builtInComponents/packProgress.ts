import _ from 'lodash';

/**
 * 一个组件接入到位需要的三件事，也是集成中心抽屉里那条「一条龙」的三步。
 * 顺序即推荐顺序：先有数据，再有图，最后才谈告警。
 */
export type PackStepKey = 'collect' | 'dashboard' | 'alert';

export const PACK_STEPS: PackStepKey[] = ['collect', 'dashboard', 'alert'];

export const PACK_PROGRESS_STORAGE_KEY = 'n9e_builtin_pack_progress';

/** ident -> 已完成的步骤 */
export type PackProgress = Record<string, PackStepKey[]>;

/**
 * 合并一步进度。
 *
 * 纯函数，读写分离：存储层可能拿到任意形状的历史数据（手改过、旧版本写的），
 * 校验和归一都放这里，好单测。
 */
export function withPackStep(progress: unknown, ident: string, step: PackStepKey): PackProgress {
  const next: PackProgress = {};
  if (progress && typeof progress === 'object' && !Array.isArray(progress)) {
    _.forEach(progress as Record<string, unknown>, (value, key) => {
      if (!Array.isArray(value)) return;
      const steps = _.filter(value, (item): item is PackStepKey => _.includes(PACK_STEPS, item as PackStepKey));
      if (steps.length > 0) next[key] = steps;
    });
  }
  if (!ident) return next;
  next[ident] = _.union(next[ident] ?? [], [step]);
  return next;
}

export function readPackProgress(): PackProgress {
  try {
    const raw = localStorage.getItem(PACK_PROGRESS_STORAGE_KEY);
    // 归一走同一条路：传一个不会命中的 ident，只借它的清洗逻辑
    return withPackStep(raw ? JSON.parse(raw) : {}, '', 'collect');
  } catch (e) {
    return {};
  }
}

export function markPackStep(ident: string, step: PackStepKey) {
  if (!ident) return;
  try {
    const raw = localStorage.getItem(PACK_PROGRESS_STORAGE_KEY);
    const next = withPackStep(raw ? JSON.parse(raw) : {}, ident, step);
    localStorage.setItem(PACK_PROGRESS_STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    // 记不住只影响勾选状态，不该打断导入本身
  }
}
