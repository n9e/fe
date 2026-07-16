import { useContext } from 'react';
import { useRequest } from 'ahooks';

import { CommonStateContext } from '@/App';
import { getTeamInfoList } from '@/services/manage';

interface UserGroup {
  id: number;
  name: string;
}

/**
 * 拉取当前用户可见的团队（user group）用于「授权团队」选择。
 * - options：下拉选项；
 * - myGroupIds：普通用户返回其所属/创建的全部团队 id（用于新建时默认选中「我的团队」），
 *   管理员返回空数组（getTeamInfoList 对管理员返回全部团队，不宜默认全选）。
 *
 * 通过 useRequest 的 cacheKey 共享缓存：List、AddDrawer、Form 同屏多次调用只发一次请求。
 */
export default function useUserGroups() {
  const { profile } = useContext(CommonStateContext);
  const { data } = useRequest(() => getTeamInfoList().then((res) => (res.dat ?? []) as UserGroup[]), {
    cacheKey: 'mcp-server-user-groups',
    staleTime: 60000,
  });
  const groups = data ?? [];

  const options = groups.map((g) => ({ label: g.name, value: g.id }));
  const myGroupIds = profile?.admin ? [] : groups.map((g) => g.id);

  return { options, myGroupIds };
}
