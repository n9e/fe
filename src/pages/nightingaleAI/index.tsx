import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Spin, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { Blocks, Bot, Cable, MessageSquarePlus, PanelLeftClose, PanelLeftOpen, RadioTower, Share2 } from 'lucide-react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';

import { CommonStateContext } from '@/App';
import { useAiChatContext } from '@/components/AiChatNG';
import ChatHistory from '@/components/AiChatNG/ChatHistory';
import ChatPanel from '@/components/AiChatNG/ChatPanel';
import { buildPageFrom } from '@/components/AiChatNG/recommend';
import { buildAiChatShareUrl, copyAiChatShareUrl } from '@/components/AiChatNG/share';
import { IAiChatHistoryItem } from '@/components/AiChatNG/types';
import { IS_ENT, IS_PLUS } from '@/utils/constant';

// @ts-ignore
import { AiTaskPage, MCPServerList } from 'plus:/parcels/NightingaleAI';

const LLMConfigList = React.lazy(() => import('@/pages/aiConfig/llmConfigs/pages/List'));
const SkillList = React.lazy(() => import('@/pages/aiConfig/skills/pages/List'));

const PAGE_PATH = '/nightingale-ai';
const SIDEBAR_WIDTH_STORAGE_KEY = 'nightingale-ai-sidebar-width';
const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_MAX_WIDTH = 480;

const configItems = [
  { key: 'llm-configs', labelKey: 'nightingale.llm_configs', icon: Bot, perm: '/ai-config/llm-configs', component: LLMConfigList, plusOnly: false },
  { key: 'skills', labelKey: 'nightingale.skills', icon: Blocks, perm: '/ai-config/skills', component: SkillList, plusOnly: false },
  { key: 'mcp-servers', labelKey: 'nightingale.mcp_servers', icon: Cable, perm: '/ai-config/mcp-servers', component: MCPServerList, plusOnly: true },
  { key: 'ai-task', labelKey: 'nightingale.ai_task', icon: RadioTower, perm: '/ai-task', component: AiTaskPage, plusOnly: true },
] as const;

type ConfigItemKey = (typeof configItems)[number]['key'];

function getConfigItem(pathname: string) {
  const key = pathname.slice(`${PAGE_PATH}/`.length) as ConfigItemKey;
  return configItems.find((item) => item.key === key);
}

function getChatId(pathname: string) {
  const match = pathname.match(/^\/nightingale-ai\/chat\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

function getInitialSidebarWidth() {
  const savedWidth = Number(localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY));
  if (Number.isFinite(savedWidth) && savedWidth >= SIDEBAR_MIN_WIDTH && savedWidth <= SIDEBAR_MAX_WIDTH) return savedWidth;
  return 280;
}

export default function NightingaleAIPage() {
  const { t } = useTranslation('ai_chat_ng');
  const history = useHistory();
  const location = useLocation();
  const { profile, perms } = useContext(CommonStateContext);
  const { cachedSessionId, setCachedSessionId } = useAiChatContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [historyItems, setHistoryItems] = useState<IAiChatHistoryItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<IAiChatHistoryItem>();
  const sidebarResizingRef = useRef(false);
  const sidebarResizeStartXRef = useRef(0);
  const sidebarWidthStartRef = useRef(sidebarWidth);
  const lastHistoryRefreshChatIdRef = useRef<string>();
  const configItem = useMemo(() => getConfigItem(location.pathname), [location.pathname]);
  const chatId = useMemo(() => getChatId(location.pathname), [location.pathname]);
  const isConfigPath = location.pathname.startsWith(`${PAGE_PATH}/`);
  const isAdmin = profile?.roles?.includes('Admin');
  const visibleConfigItems = useMemo(() => configItems.filter((item) => (!item.plusOnly || (IS_PLUS && !IS_ENT)) && (isAdmin || perms?.includes(item.perm))), [isAdmin, perms]);
  const chatPageFrom = useMemo(() => buildPageFrom({ url: PAGE_PATH }), []);

  useEffect(() => {
    const isNewChat = (location.state as { newChat?: boolean } | undefined)?.newChat;
    if (location.pathname === PAGE_PATH && cachedSessionId && !isNewChat) {
      history.replace(`${PAGE_PATH}/chat/${encodeURIComponent(cachedSessionId)}`);
    }
  }, [cachedSessionId, history, location.pathname, location.state]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!sidebarResizingRef.current) return;
      const nextWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, sidebarWidthStartRef.current + event.clientX - sidebarResizeStartXRef.current));
      setSidebarWidth(nextWidth);
    };
    const onMouseUp = () => {
      if (!sidebarResizingRef.current) return;
      sidebarResizingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidth));
  }, [sidebarWidth]);

  const goToChat = useCallback(() => {
    setSelectedChat(undefined);
    history.push(PAGE_PATH, { newChat: true });
  }, [history]);

  const selectChat = useCallback(
    (chat: IAiChatHistoryItem) => {
      setSelectedChat(chat);
      setCachedSessionId(chat.chat_id);
      const nextPath = `${PAGE_PATH}/chat/${encodeURIComponent(chat.chat_id)}`;
      if (location.pathname !== nextPath) history.push(nextPath);
    },
    [history, location.pathname, setCachedSessionId],
  );

  const selectConfig = useCallback((key: ConfigItemKey) => history.push(`${PAGE_PATH}/${key}`), [history]);

  const startSidebarResize = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      sidebarResizingRef.current = true;
      sidebarResizeStartXRef.current = event.clientX;
      sidebarWidthStartRef.current = sidebarWidth;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ew-resize';
    },
    [sidebarWidth],
  );

  const ConfigPage = configItem?.component;
  const handleChatChange = useCallback(
    (chat?: IAiChatHistoryItem) => {
      if (!chat?.chat_id) return;
      setSelectedChat(chat);
      setCachedSessionId(chat.chat_id);
      if (chat.chat_id === chatId) return;
      if (!chatId && lastHistoryRefreshChatIdRef.current !== chat.chat_id) {
        lastHistoryRefreshChatIdRef.current = chat.chat_id;
        setHistoryRefreshKey((key) => key + 1);
      }
      history.replace(`${PAGE_PATH}/chat/${encodeURIComponent(chat.chat_id)}`);
    },
    [chatId, history, setCachedSessionId],
  );

  const handleShare = useCallback(() => {
    if (chatId) copyAiChatShareUrl(buildAiChatShareUrl(chatId), t('toolbar.share_copied'));
  }, [chatId, t]);
  const handleHistoryLoaded = useCallback((nextHistoryItems: IAiChatHistoryItem[]) => setHistoryItems(nextHistoryItems), []);
  const historyChat = useMemo(() => historyItems.find((item) => item.chat_id === chatId), [chatId, historyItems]);
  const chatTitle = chatId ? historyChat?.title || (selectedChat?.chat_id === chatId ? selectedChat.title : t('nightingale.title')) : t('nightingale.new_chat');

  if (isConfigPath && !configItem && !chatId) return <Redirect to={PAGE_PATH} />;
  if (configItem && !isAdmin && perms && !perms.includes(configItem.perm)) return <Redirect to='/403' />;

  return (
    <div className='flex h-full min-h-0 overflow-hidden bg-fc-50'>
      <aside
        className={`relative flex min-h-0 flex-col overflow-hidden bg-fc-50 ${sidebarCollapsed ? 'w-0 border-r-0' : 'shrink-0 border-r border-fc-300'}`}
        style={sidebarCollapsed ? undefined : { width: sidebarWidth }}
      >
        <div className='flex h-12 shrink-0 items-center justify-between py-0 pl-4 pr-3'>
          <span className='whitespace-nowrap text-l2 font-semibold text-title'>{t('nightingale.title')}</span>
          <Button
            aria-label={t('nightingale.collapse_sidebar')}
            className='inline-flex items-center justify-center text-hint'
            icon={<PanelLeftClose size={16} strokeWidth={1.5} />}
            size='small'
            type='text'
            onClick={() => setSidebarCollapsed(true)}
          />
        </div>
        <nav className='flex flex-col gap-1 p-2'>
          <button
            className={`flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md border-0 px-2.5 text-left text-main hover:bg-primary/10 hover:text-primary ${
              !configItem && !chatId ? 'bg-primary/10 text-primary' : 'bg-transparent'
            }`}
            type='button'
            onClick={goToChat}
          >
            <MessageSquarePlus size={17} />
            <span>{t('nightingale.new_chat')}</span>
          </button>
          {visibleConfigItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md border-0 px-2.5 text-left text-main hover:bg-primary/10 hover:text-primary ${
                  configItem?.key === item.key ? 'bg-primary/10 text-primary' : 'bg-transparent'
                }`}
                type='button'
                onClick={() => selectConfig(item.key)}
              >
                <Icon size={17} />
                <span>{t(item.labelKey)}</span>
              </button>
            );
          })}
        </nav>
        <div className='mx-4 h-px bg-fc-300' />
        <div className='flex min-h-0 flex-1 flex-col p-2'>
          <div className='px-2 pb-2 text-base font-semibold text-hint'>{t('nightingale.sessions')}</div>
          <ChatHistory compact searchable showActions refreshKey={historyRefreshKey} selectedChatId={chatId} onHistoryLoaded={handleHistoryLoaded} onSelect={selectChat} />
        </div>
        {!sidebarCollapsed && <div className='absolute right-0 top-0 h-full w-1 cursor-ew-resize' onMouseDown={startSidebarResize} />}
      </aside>
      <main className={`relative min-h-0 min-w-0 flex-1 overflow-auto ${sidebarCollapsed && configItem ? '[&_.page-header-title]:pl-6' : ''}`}>
        {sidebarCollapsed && (
          <Button
            aria-label={t('nightingale.expand_sidebar')}
            className='absolute left-3 top-3 z-10 inline-flex items-center justify-center text-hint'
            icon={<PanelLeftOpen size={16} strokeWidth={1.5} />}
            size='small'
            type='text'
            onClick={() => setSidebarCollapsed(false)}
          />
        )}
        {ConfigPage ? (
          <React.Suspense
            fallback={
              <div className='flex h-full items-center justify-center'>
                <Spin />
              </div>
            }
          >
            <ConfigPage />
          </React.Suspense>
        ) : (
          <div className='flex h-full min-h-0 flex-col'>
            <div className='flex h-12 shrink-0 items-center justify-between border-b border-fc-300 px-4'>
              <span className='truncate font-semibold text-title'>{chatTitle}</span>
              {chatId && (
                <Tooltip title={t('toolbar.share')}>
                  <Button aria-label={t('toolbar.share')} icon={<Share2 size={16} />} size='small' type='text' onClick={handleShare} />
                </Tooltip>
              )}
            </div>
            <div className='min-h-0 flex-1 p-4'>
              <ChatPanel chatId={chatId} queryPageFrom={chatPageFrom} onChatChange={handleChatChange} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
