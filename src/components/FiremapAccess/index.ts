import { useContext } from 'react';
import { CommonStateContext } from '@/App';

export interface FiremapAccessInput {
  profile?: { admin?: boolean; roles?: string[] } | null;
  perms?: string[] | null;
  permsLoaded?: boolean;
}

/** 产品入口权限来自 self/perms；空间内读写权限仍由原有逻辑控制。 */
export function canAccessFiremap({ profile, perms, permsLoaded }: FiremapAccessInput): boolean {
  if (profile?.admin || profile?.roles?.includes('Admin')) return true;
  return permsLoaded !== false && !!perms?.includes('/firemap');
}

export function useCanAccessFiremap(): boolean {
  return canAccessFiremap(useContext(CommonStateContext));
}

export function useCanShowFiremapIntroduction(surface: 'home' | 'empty'): boolean {
  const canAccess = useCanAccessFiremap();
  const { homeMode = 'show', emptyMode = 'show' } = useContext(CommonStateContext);
  return canAccess && (surface === 'home' ? homeMode : emptyMode) === 'show';
}
