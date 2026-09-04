/*
 * Grafana datasource 引用 → N9E datasourceCate / datasourceValue 的解析。
 *
 * N9E 运行时解析模型：面板 datasourceValue（或 target.datasource.id）必须是数字 id 或 `${变量名}`，
 * 经 replaceDatasourceVariables 解析为数字 id，失败则查询被跳过；type:'datasource' 变量的 definition=cate，
 * 运行时自动从对应 cate 的数据源列表生成选项并选中。grafana uid 无法映射到 N9E 数字 id，
 * 因此一律归一化为变量引用，绝不输出字面 uid。
 */
import _ from 'lodash';

import type { GrafanaPanel } from './types';

export interface DatasourceVarRef {
  name: string;
  cate: string;
}

export interface ResolvedDatasource {
  cate: string;
  value: string; // '${变量名}'
  supported: boolean;
}

/** 当前转换支持的数据源 cate（prometheus + postgres） */
export const SUPPORTED_CATES = ['prometheus', 'pgsql'];

export function isSupportedCate(cate: string): boolean {
  return SUPPORTED_CATES.includes(cate);
}

/** grafana 插件 type → N9E cate（大小写不敏感） */
export function normalizeCate(type: unknown): string {
  if (typeof type !== 'string' || !type) return 'unknown';
  const t = type.trim().toLowerCase();
  if (t === 'postgres' || t === 'postgresql') return 'pgsql';
  if (t === 'prometheus') return 'prometheus';
  return t;
}

/** 取某 cate 的默认数据源变量引用 */
function defaultVarRefFor(cate: string, vars: DatasourceVarRef[]): string {
  const found = vars.find((v) => v.cate === cate);
  return found ? `\${${found.name}}` : '${datasource}';
}

export interface ResolveContext {
  /** 已生成的数据源变量（name + cate） */
  datasourceVars: DatasourceVarRef[];
  /** $datasource 解析时优先使用的 __inputs 数据源变量名 */
  inputsFallbackName?: string;
}

/** 解析单个 grafana datasource 引用（panel.datasource / target.datasource） */
export function resolveDatasourceRef(ds: unknown, ctx: ResolveContext): ResolvedDatasource {
  const vars = ctx.datasourceVars;
  const promRef = defaultVarRefFor('prometheus', vars);

  if (_.isPlainObject(ds)) {
    const type = (ds as any).type;
    const uid = (ds as any).uid;
    const cate = normalizeCate(type);
    // templated uid：${DS_X} → 若 vars 中存在 cate 可识别的同名数据源变量则复用该引用；
    // 否则（变量不存在 / cate 不可识别）回退该 cate 默认变量，避免悬空引用或误判丢弃
    if (typeof uid === 'string' && /^\$\{([^}]+)\}$/.test(uid)) {
      const varName = uid.slice(2, -1);
      const dsVar = vars.find((v) => v.name === varName);
      if (dsVar && isSupportedCate(dsVar.cate)) {
        return { cate: dsVar.cate, value: uid, supported: true };
      }
      return { cate, value: defaultVarRefFor(cate, vars), supported: isSupportedCate(cate) };
    }
    // 字面 uid 或无 uid → 引用该 cate 的默认变量
    return { cate, value: defaultVarRefFor(cate, vars), supported: isSupportedCate(cate) };
  }

  if (typeof ds === 'string') {
    const trimmed = ds.trim();
    if (trimmed === '$datasource' || trimmed === '${datasource}') {
      // grafana 导出的隐藏 constant，优先解析到 __inputs 数据源变量
      const name = ctx.inputsFallbackName || 'datasource';
      const dsVar = vars.find((v) => v.name === name);
      const cate = dsVar?.cate ?? 'prometheus';
      return { cate, value: `\${${name}}`, supported: isSupportedCate(cate) };
    }
    const match = trimmed.match(/^\$\{([^}]+)\}$/);
    if (match) {
      const dsVar = vars.find((v) => v.name === match[1]);
      const cate = dsVar?.cate ?? 'prometheus';
      return { cate, value: trimmed, supported: isSupportedCate(cate) };
    }
    if (trimmed.startsWith('$')) {
      const varName = trimmed.slice(1);
      const dsVar = vars.find((v) => v.name === varName);
      const cate = dsVar?.cate ?? 'prometheus';
      return { cate, value: `\${${varName}}`, supported: isSupportedCate(cate) };
    }
    // 旧名字符串（如 'Prometheus'，< v33 未迁移）→ 默认 prom 数据源变量引用
    return { cate: 'prometheus', value: promRef, supported: true };
  }

  // null / undefined → 默认 prom 数据源变量引用
  return { cate: 'prometheus', value: promRef, supported: true };
}

/** 收集面板中实际使用的数据源 cate 集合（用于兜底创建数据源变量） */
export function collectPanelCates(panels: GrafanaPanel[] | undefined): string[] {
  const cates = new Set<string>();
  const visit = (ref: unknown) => {
    if (_.isPlainObject(ref)) {
      const cate = normalizeCate((ref as any).type);
      if (cate !== 'unknown') cates.add(cate);
    }
  };
  const walk = (list: GrafanaPanel[] | undefined) => {
    for (const panel of list || []) {
      visit(panel.datasource);
      for (const target of panel.targets || []) {
        visit(target.datasource);
      }
      if (panel.type === 'row' && Array.isArray(panel.panels)) {
        walk(panel.panels);
      }
    }
  };
  walk(panels);
  return Array.from(cates);
}
