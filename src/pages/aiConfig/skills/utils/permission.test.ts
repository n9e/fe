import { canModifySkill } from './permission';

describe('canModifySkill', () => {
  const admin = { admin: true, username: 'root' };
  const alice = { admin: false, username: 'alice' };

  it('admin can modify any skill', () => {
    expect(canModifySkill({ user_group_ids: [], created_by: 'bob', updated_by: 'bob' }, admin)).toBe(true);
  });

  it('team skill defers to backend and stays actionable', () => {
    expect(canModifySkill({ user_group_ids: [1], created_by: 'bob', updated_by: 'bob' }, alice)).toBe(true);
  });

  it('legacy skill: creator can modify', () => {
    expect(canModifySkill({ user_group_ids: [], created_by: 'alice', updated_by: 'bob' }, alice)).toBe(true);
  });

  it('legacy skill: last updater can modify', () => {
    expect(canModifySkill({ user_group_ids: [], created_by: 'bob', updated_by: 'alice' }, alice)).toBe(true);
  });

  it('legacy skill: unrelated user cannot modify', () => {
    expect(canModifySkill({ user_group_ids: [], created_by: 'bob', updated_by: 'bob' }, alice)).toBe(false);
  });
});
