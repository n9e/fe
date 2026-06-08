import { message } from 'antd';
import { copy2ClipBoard } from '@/utils';

export const aiChatShareQueryKey = 'ai_chat_share_id';
export const aiChatShareReadonlyQueryKey = 'ai_chat_readonly';

export function buildAiChatShareUrl(chatId: string): string {
  const url = new URL(window.location.pathname + window.location.search, window.location.origin);
  url.searchParams.set(aiChatShareQueryKey, chatId);
  url.searchParams.set(aiChatShareReadonlyQueryKey, '1');
  return url.toString();
}

export function copyAiChatShareUrl(url: string, successText: string): boolean {
  const succeeded = copy2ClipBoard(url, true);
  if (succeeded) {
    message.success(successText);
  }
  return succeeded;
}

export function cleanShareParamsFromUrl() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const hadShareParams = url.searchParams.has(aiChatShareQueryKey) || url.searchParams.has(aiChatShareReadonlyQueryKey);
  if (!hadShareParams) return;
  url.searchParams.delete(aiChatShareQueryKey);
  url.searchParams.delete(aiChatShareReadonlyQueryKey);
  window.history.replaceState(null, '', url.toString());
}
