import _ from 'lodash';

import { Payload } from '@/pages/builtInComponents/services';

import { PACK_BOARD_UUIDS } from '../constants';


export interface ResolvedPack {
  /** 可选的全部大盘 payload，用于预览列表 */
  boards: Payload[];
  /** 可选的全部告警规则 payload（已按 cate 限定到基础包那一份文件） */
  rules: Payload[];
  /** 默认勾选的大盘 payload id */
  defaultBoardIds: number[];
  /** 默认勾选的告警规则 payload id */
  defaultRuleIds: number[];
  /**
   * 是否有钉住的大盘 uuid 没匹配上。
   * 自建/改过 integrations 目录的用户可能重新生成过 uuid，此时不猜、不乱导，
   * 由 UI 提示用户从预览列表里手工勾选 —— 导进一个没数据的大盘比不导更让人困惑。
   */
  boardsIncomplete: boolean;
}

/**
 * 按钉住的 uuid 选出基础包的大盘。
 *
 * 用 String 比较而不是数值比较：uuid 超过 Number.MAX_SAFE_INTEGER，JSON.parse 后已是有精度损失的
 * double，转字符串比较既能稳定还原字面量，也能兼容以后后端把 uuid 换成字符串。
 */
export function resolvePackBoards(payloads: Payload[]): Payload[] {
  const pinned = _.filter(payloads, (payload) => _.includes(PACK_BOARD_UUIDS, String(payload?.uuid)));
  // 按 PACK_BOARD_UUIDS 的顺序输出，让「机器常用指标」稳定排在「台账表格视图」前面
  return _.sortBy(pinned, (payload) => _.indexOf(PACK_BOARD_UUIDS, String(payload?.uuid)));
}

export function resolvePack(boardPayloads: Payload[], rulePayloads: Payload[]): ResolvedPack {
  const boards = boardPayloads ?? [];
  const rules = rulePayloads ?? [];
  const pinnedBoards = resolvePackBoards(boards);

  return {
    boards,
    rules,
    defaultBoardIds: _.map(pinnedBoards, 'id'),
    // 告警规则整份文件就是基础包的范围（cate 已过滤），默认全选
    defaultRuleIds: _.map(rules, 'id'),
    boardsIncomplete: pinnedBoards.length < PACK_BOARD_UUIDS.length,
  };
}
