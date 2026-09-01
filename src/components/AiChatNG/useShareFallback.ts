import { useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { AppError } from '@/utils/appError';
import { IS_ENT } from '@/utils/constant';
import { clearPageError } from '@/utils/pageError';

import { aiChatShareQueryKey } from './share';

/** 落到 FlashAI 会话页时带上这个标记，页面据此提示「你是被降级过来的」 */
export const aiChatShareFallbackQueryKey = 'ai_chat_share_fallback';

type ShareFallbackPathResolver = (chatId: string) => string | null;

/**
 * 降级的落点因构建而异：这里的会话页只在开源版注册（见 pages/nightingaleAI/entry.tsx），
 * 企业版的 FlashAI 是另一套路由。与其让这里猜一个自己并不注册的路径，不如由那一侧
 * 自己登记落点；没人登记就不降级。
 */
let resolveFallbackPath: ShareFallbackPathResolver = (chatId) => (IS_ENT ? null : `/nightingale-ai/chat/${encodeURIComponent(chatId)}`);

export function setAiChatShareFallbackPathResolver(resolver: ShareFallbackPathResolver) {
  resolveFallbackPath = resolver;
}

/**
 * 分享链接的降级守卫。
 *
 * 分享链接是「原页面 URL + ai_chat_share_id」，收到链接的人不一定有原页面的权限。
 * 以前这种情况直接被 403 挡住，对话根本看不到。现在改成退一步：既然对话本身在
 * FlashAI 菜单下有独立入口，就把人送到那儿去看同一个会话，只是少了原页面的环境。
 *
 * 返回 true 表示正在降级跳转，调用方此时不要再渲染整页错误。
 */
export function useAiChatShareFallback(pageError: AppError | null): boolean {
  const history = useHistory();
  const location = useLocation();

  const shareChatId = useMemo(() => new URLSearchParams(location.search).get(aiChatShareQueryKey), [location.search]);
  const fallbackPath = useMemo(() => (shareChatId ? resolveFallbackPath(shareChatId) : null), [shareChatId]);
  const shouldFallback = !!pageError && pageError.status === 403 && !!fallbackPath;

  useEffect(() => {
    if (!shouldFallback || !fallbackPath) return;
    clearPageError();
    // 用 replace 不用 push：让后退键回到用户点链接之前的地方，
    // 而不是又回到那个没权限的页面再错一次
    history.replace(`${fallbackPath}${fallbackPath.includes('?') ? '&' : '?'}${aiChatShareFallbackQueryKey}=1`);
  }, [shouldFallback, fallbackPath, history]);

  return shouldFallback;
}
