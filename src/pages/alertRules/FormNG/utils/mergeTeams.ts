export type TeamOption = {
  id: string | number;
  name?: string;
  [key: string]: unknown;
};

/**
 * 团队列表接口数据优先，详情接口中内嵌的已配置团队用于补全无列表权限时的名称回显。
 */
export function mergeTeams(teams: TeamOption[], configuredTeams?: TeamOption[] | null): TeamOption[] {
  const mergedTeams = new Map<string, TeamOption>();
  const allTeams = [...(Array.isArray(teams) ? teams : []), ...(Array.isArray(configuredTeams) ? configuredTeams : [])];

  for (const team of allTeams) {
    if (team?.id == null) continue;

    const id = String(team.id);
    if (!mergedTeams.has(id)) {
      mergedTeams.set(id, team);
    }
  }

  return Array.from(mergedTeams.values());
}
