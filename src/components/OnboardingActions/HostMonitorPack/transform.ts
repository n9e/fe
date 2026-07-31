import _ from 'lodash';

import { HOST_PACK_TAG } from '@/components/OnboardingProgress/detect';

/** 大盘 tags 是空格分隔的自由字符串（见 pages/dashboard/List 的搜索逻辑），幂等地追加基础包标记 */
export function appendPackTag(tags?: string): string {
  const parts = _.compact(_.split(_.trim(tags ?? ''), /\s+/));
  if (_.includes(parts, HOST_PACK_TAG)) {
    return _.join(parts, ' ');
  }
  return _.join([...parts, HOST_PACK_TAG], ' ');
}

export interface BoardImportBody {
  name: string;
  ident: string;
  tags: string;
  configs: string;
}

/**
 * 内置大盘 payload 的 content（JSON 字符串）→ POST /busi-group/:id/boards 的 body。
 *
 * 与集成中心的导入保持一致：`configs` 必须再 stringify 一次（后端 boardForm.Configs 是字符串）。
 * 额外做的事是在 tags 上追加基础包标记 —— 这里追加而不是在后端做，是因为 payload 到前端时
 * name/tags 已被按 X-Language 翻译过，前端追加能保证标记本身不随语言变化。
 */
export function buildBoardImportBody(content: string): BoardImportBody {
  const parsed = JSON.parse(content);
  const board = _.isArray(parsed) ? parsed[0] : parsed;
  return {
    name: board?.name ?? '',
    ident: board?.ident ?? '',
    tags: appendPackTag(board?.tags),
    configs: JSON.stringify(board?.configs),
  };
}

export interface AlertRuleImportOptions {
  /** DatasourceValueSelectV2 产出的 datasource_queries，host 类规则不需要 */
  datasourceQueries?: unknown[];
  /** 选中的通知规则，直接写进导入 body 即可生效，不必导完再批量改 */
  notifyRuleIds?: number[];
}

/** 模板字段整体透传 + 本次改写的字段；name 是后端落库与导入响应 map 的 key */
export interface AlertRuleImportBody extends Record<string, unknown> {
  name?: string;
  cate: string;
  datasource_queries: unknown[];
  disabled: number;
  notify_version: number;
  notify_rule_ids: number[];
}

/**
 * 内置告警规则 payload 的 content → POST /busi-group/:id/alert-rules/import 的单项 body。
 *
 * 与 builtInComponents/AlertRules/Import.tsx 的变换对齐，两点有意不同：
 * 1. `disabled: 0` —— 步骤叫「启用主机告警」，一键即可用才是目的；集成中心那边默认不启用。
 *    引导完成态判定也要求 disabled===0，这里保持自洽。
 * 2. host 类规则的 datasource_queries 传空数组 —— 机器失联这类规则不依赖数据源，
 *    后端会自动填 DataSourceQueryAll。
 */
export function buildAlertRuleImportBody(content: string, options: AlertRuleImportOptions): AlertRuleImportBody {
  const parsed = JSON.parse(content);
  const rule = _.isArray(parsed) ? parsed[0] : parsed;
  const record = _.omit(rule, ['id', 'group_id', 'create_at', 'create_by', 'update_at', 'update_by']);
  const isHostRule = record.cate === 'host';

  return {
    ...record,
    cate: isHostRule ? 'host' : 'prometheus',
    datasource_queries: isHostRule ? [] : options.datasourceQueries ?? [],
    disabled: 0,
    notify_version: 1,
    notify_rule_ids: options.notifyRuleIds ?? [],
  };
}
