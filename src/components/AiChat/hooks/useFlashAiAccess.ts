import { useContext } from 'react';
import { CommonStateContext } from '@/App';
import { IS_ENT } from '@/utils/constant';

/** Enterprise integration replaces AiChat with SRM's permission-aware implementation. */
export function useCanAccessFlashAiChat(): boolean {
  const { perms, profile } = useContext(CommonStateContext);
  return !IS_ENT || !!profile?.admin || !!profile?.roles?.includes('Admin') || !!perms?.some((perm) => perm === '/flashai' || perm === '/flashAI');
}

export function useCanShowFlashAiIntroduction(surface: 'home' | 'empty'): boolean {
  const canAccess = useCanAccessFlashAiChat();
  const { homeMode = 'show', emptyMode = 'show' } = useContext(CommonStateContext);
  return canAccess && (!IS_ENT || (surface === 'home' ? homeMode : emptyMode) === 'show');
}
