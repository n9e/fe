import { mergeTeams } from './mergeTeams';

describe('mergeTeams', () => {
  it('团队列表为空时使用规则详情内嵌的团队回显名称', () => {
    expect(
      mergeTeams(
        [],
        [
          { id: 217, name: 'ccwork_test_team' },
          { id: 228, name: 'codex-cleanroom-team-none-20260707' },
        ],
      ),
    ).toEqual([
      { id: 217, name: 'ccwork_test_team' },
      { id: 228, name: 'codex-cleanroom-team-none-20260707' },
    ]);
  });

  it('按团队 ID 去重，并优先使用团队列表中的最新名称', () => {
    expect(
      mergeTeams(
        [{ id: '217', name: '最新团队名' }],
        [
          { id: 217, name: '历史团队名' },
          { id: 228, name: '详情中的团队' },
        ],
      ),
    ).toEqual([
      { id: '217', name: '最新团队名' },
      { id: 228, name: '详情中的团队' },
    ]);
  });

  it('详情未返回团队对象时不构造选项，界面可继续回退显示 ID', () => {
    expect(mergeTeams([], [])).toEqual([]);
  });
});
