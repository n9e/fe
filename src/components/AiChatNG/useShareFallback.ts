import { useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { AppError } from '@/utils/appError';
import { clearPageError } from '@/utils/pageError';

import { aiChatShareQueryKey } from './share';

/** 落到 FlashAI 会话页时带上这个标记，页面据此提示「你是被降级过来的」 */
export const aiChatShareFallbackQueryKey = 'ai_chat_share_fallback';

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
  const shouldFallback = !!pageError && pageError.status === 403 && !!shareChatId;

  useEffect(() => {
    if (!shouldFallback || !shareChatId) return;
    clearPageError();
    // 用 replace 不用 push：让后退键回到用户点链接之前的地方，
    // 而不是又回到那个没权限的页面再错一次
    history.replace(`/nightingale-ai/chat/${encodeURIComponent(shareChatId)}?${aiChatShareFallbackQueryKey}=1`);
  }, [shouldFallback, shareChatId, history]);

  return shouldFallback;
}
