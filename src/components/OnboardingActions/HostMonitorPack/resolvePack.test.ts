import { Payload } from '@/pages/builtInComponents/services';
import { TypeEnum } from '@/pages/builtInComponents/types';

import { resolvePack, resolvePackBoards } from './resolvePack';

// 取自 integrations/Linux/dashboards/*.json 的真实 uuid 与名称
const DETAIL_UUID = 1737103014612000;
const OVERVIEW_UUID = 1717556327742611000;
const TABLE_NG_UUID = 1756720567064000;
const EXPORTER_UUID = 1717556327748611000;

function boardPayload(id: number, uuid: number, name: string, tags = 'Categraf'): Payload {
  return {
    id,
    uuid,
    type: TypeEnum.dashboard,
    component_id: 1,
    cate: '',
    name,
    content: JSON.stringify({ uuid, name, tags, ident: '', configs: { panels: [] } }),
  };
}

function rulePayload(id: number, name: string, cate: string): Payload {
  return {
    id,
    uuid: id,
    type: TypeEnum.alert,
    component_id: 1,
    cate: 'linux_by_categraf',
    name,
    content: JSON.stringify({ name, cate, disabled: 1 }),
  };
}

const ALL_BOARDS = [
  boardPayload(1, DETAIL_UUID, '机器常用指标（如果只想看当前业务组内的机器…）'),
  boardPayload(2, OVERVIEW_UUID, '机器台账表格视图（使用 Categraf 作为采集器）'),
  boardPayload(3, TABLE_NG_UUID, 'Host Table NG'),
  boardPayload(4, EXPORTER_UUID, '机器常用指标（使用 NodeExporter 作为采集器）', 'NodeExporter'),
];

describe('resolvePackBoards', () => {
  it('picks exactly the two pinned dashboards out of all five Linux dashboards', () => {
    expect(resolvePackBoards(ALL_BOARDS).map((item) => item.id)).toEqual([1, 2]);
  });

  it('orders them by the pinned list, not by the order the API returned', () => {
    const reversed = [ALL_BOARDS[1], ALL_BOARDS[0]];
    // 机器常用指标（detail）应稳定排在台账表格视图（overview）之前
    expect(resolvePackBoards(reversed).map((item) => item.uuid)).toEqual([DETAIL_UUID, OVERVIEW_UUID]);
  });

  it('matches uuids beyond Number.MAX_SAFE_INTEGER — the overview uuid is 1.7e18', () => {
    // 该 uuid 远超 2^53，JSON.parse 后已是有精度损失的 double；String() 必须还能还原出原字面量，
    // 否则钉住会静默失配、每次都当成「模板缺失」
    expect(OVERVIEW_UUID).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
    expect(String(JSON.parse(`{"uuid":${OVERVIEW_UUID}}`).uuid)).toBe('1717556327742611000');
    expect(resolvePackBoards([ALL_BOARDS[1]])).toHaveLength(1);
  });

  it('ignores dashboards whose name looks like a host dashboard but is not pinned', () => {
    // exporter-detail 名字也含「机器」，但采集器不是 Categraf，不能进基础包
    expect(resolvePackBoards([ALL_BOARDS[3]])).toEqual([]);
  });

  it('tolerates an empty payload list', () => {
    expect(resolvePackBoards([])).toEqual([]);
  });
});

describe('resolvePack', () => {
  const rules = [rulePayload(11, 'Lost connection with monitoring target - categraf', 'host'), rulePayload(12, '大于200G的盘，空间不足了', 'prometheus')];

  it('preselects the pinned boards and every rule in the pack file', () => {
    const resolved = resolvePack(ALL_BOARDS, rules);
    expect(resolved.defaultBoardIds).toEqual([1, 2]);
    expect(resolved.defaultRuleIds).toEqual([11, 12]);
    expect(resolved.boardsIncomplete).toBe(false);
  });

  it('keeps the full candidate lists so the preview can offer a manual pick', () => {
    const resolved = resolvePack(ALL_BOARDS, rules);
    expect(resolved.boards).toHaveLength(4);
    expect(resolved.rules).toHaveLength(2);
  });

  it('flags an incomplete pack instead of guessing when a pinned uuid is missing', () => {
    // 自建 / 改过 integrations 目录的用户可能重新生成过 uuid：宁可提示手工勾选，也不导进一个没数据的大盘
    const resolved = resolvePack([ALL_BOARDS[0], ALL_BOARDS[3]], rules);
    expect(resolved.defaultBoardIds).toEqual([1]);
    expect(resolved.boardsIncomplete).toBe(true);
  });

  it('does not blow up when the API returned nothing', () => {
    const resolved = resolvePack([], []);
    expect(resolved.defaultBoardIds).toEqual([]);
    expect(resolved.defaultRuleIds).toEqual([]);
    expect(resolved.boardsIncomplete).toBe(true);
  });
});
