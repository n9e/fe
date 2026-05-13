interface SidebarProfile {
  nickname?: string;
  username?: string;
  email?: string;
  phone?: string;
}

export function getSidebarProfileDisplay(profile: SidebarProfile = {}) {
  const name = profile.nickname || profile.username || '-';
  const detail = profile.email || profile.phone || profile.username || '';
  const initialSource = name !== '-' ? name : detail;
  const initial = initialSource.trim().charAt(0).toUpperCase() || 'U';

  return {
    name,
    detail,
    initial,
  };
}
