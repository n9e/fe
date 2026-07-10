import { canModifySkill } from './permission';

describe('canModifySkill', () => {
  const admin = { admin: true, username: 'root' };
  const alice = { admin: false, username: 'alice' };

  it('uses backend can_edit when present (allow)', () => {
    expect(canModifySkill({ can_edit: true, user_group_ids: [1], created_by: 'bob', updated_by: 'bob' }, alice)).toBe(true);
  });

  it('uses backend can_edit when present (deny even if would-be owner)', () => {
    expect(canModifySkill({ can_edit: false, user_group_ids: [1], created_by: 'alice', updated_by: 'alice' }, alice)).toBe(false);
  });

  it('fallback: admin can modify any skill', () => {
    expect(canModifySkill({ user_group_ids: [], created_by: 'bob', updated_by: 'bob' }, admin)).toBe(true);
  });

  it('fallback: team skill without can_edit is denied (avoid false-open button)', () => {
    expect(canModifySkill({ user_group_ids: [1], created_by: 'bob', updated_by: 'bob' }, alice)).toBe(false);
  });

  it('fallback: legacy skill creator can modify', () => {
    expect(canModifySkill({ user_group_ids: [], created_by: 'alice', updated_by: 'bob' }, alice)).toBe(true);
  });

  it('fallback: legacy skill last updater can modify', () => {
    expect(canModifySkill({ user_group_ids: [], created_by: 'bob', updated_by: 'alice' }, alice)).toBe(true);
  });

  it('fallback: legacy skill unrelated user cannot modify', () => {
    expect(canModifySkill({ user_group_ids: [], created_by: 'bob', updated_by: 'bob' }, alice)).toBe(false);
  });
});
