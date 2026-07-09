import { Item } from '../types';

interface ProfileLike {
  admin?: boolean;
  username: string;
}

// canModifySkill 决定详情页是否给出「编辑 / 替换 / 删除」入口（仅用于非内置 skill，
// 内置 skill 的门控在详情页单独处理）。
// - 管理员始终可改。
// - 新版 skill（已设授权团队）：团队成员身份由后端校验（profile 不含团队信息），
//   前端放行、由接口 403 兜底，避免误藏按钮。
// - 旧版 skill（无授权团队）：仅创建人 / 更新人可改。
export function canModifySkill(item: Pick<Item, 'user_group_ids' | 'created_by' | 'updated_by'>, profile: ProfileLike): boolean {
  if (profile.admin) {
    return true;
  }
  if (item.user_group_ids && item.user_group_ids.length > 0) {
    return true;
  }
  return item.created_by === profile.username || item.updated_by === profile.username;
}
