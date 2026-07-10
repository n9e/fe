import { Item } from '../types';

interface ProfileLike {
  admin?: boolean;
  username: string;
}

// canModifySkill 决定详情页是否给出「编辑 / 替换 / 删除」入口（仅用于非内置 skill，
// 内置 skill 的门控在详情页单独处理）。
// - 优先用后端按请求用户盖上的 can_edit（权威，与后端 403 判定完全一致，不会出现
//   「按钮可点但保存被拒」的漂移）。IProfile 不含用户团队信息，故团队成员身份必须
//   由后端判定。
// - 兜底（老响应无 can_edit 时）：管理员或旧版无团队 skill 的创建人/更新人可改；
//   有团队却拿不到 can_edit 时保守拒绝（避免误开编辑入口）。
export function canModifySkill(item: Pick<Item, 'can_edit' | 'user_group_ids' | 'created_by' | 'updated_by'>, profile: ProfileLike): boolean {
  if (typeof item.can_edit === 'boolean') {
    return item.can_edit;
  }
  if (profile.admin) {
    return true;
  }
  if (item.user_group_ids && item.user_group_ids.length > 0) {
    return false;
  }
  return item.created_by === profile.username || item.updated_by === profile.username;
}
