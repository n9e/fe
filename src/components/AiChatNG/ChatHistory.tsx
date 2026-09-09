import React from 'react';
import { Button, Dropdown, Empty, Input, Menu, Popover, Spin } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Edit3, MessageSquare, MoreVertical, Search, Share2 } from 'lucide-react';

import { NAME_SPACE } from './constants';
import { deleteChat, getChatHistory, renameChat } from './services';
import { IAiChatHistoryItem } from './types';
import { cn } from './utils';
import { buildAiChatShareUrl, copyAiChatShareUrl } from './share';

interface IChatHistoryPageProps {
  selectedChatId?: string;
  compact?: boolean;
  searchable?: boolean;
  showActions?: boolean;
  refreshKey?: number;
  onSelect: (chat: IAiChatHistoryItem) => void;
  onShare?: (chat: IAiChatHistoryItem) => void;
  onHistoryLoaded?: (history: IAiChatHistoryItem[]) => void;
  onDelete?: (chat: IAiChatHistoryItem) => void;
  onError?: (error: Error) => void;
}

interface IChatHistoryGroup {
  key: string;
  label: string;
  items: IAiChatHistoryItem[];
}

function getHistoryGroupLabel(timestamp: number | undefined, t: (key: string) => string) {
  if (!timestamp) {
    return t('history.earlier');
  }

  const currentTime = moment.unix(timestamp);
  if (currentTime.isSame(moment(), 'day')) {
    return t('history.today');
  }

  if (currentTime.isSame(moment().subtract(1, 'day'), 'day')) {
    return t('history.yesterday');
  }

  return currentTime.format('YYYY-MM-DD');
}

function formatHistoryItemTime(timestamp: number | undefined, t: (key: string) => string) {
  if (!timestamp) {
    return t('history.unknown_time');
  }

  return moment.unix(timestamp).format('HH:mm');
}

function formatHistoryItemTooltipTime(timestamp: number | undefined, t: (key: string) => string) {
  if (!timestamp) return t('history.unknown_time');
  return moment.unix(timestamp).format('YYYY-MM-DD HH:mm');
}

export default function ChatHistory(props: IChatHistoryPageProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { selectedChatId, compact = false, searchable = false, showActions = false, refreshKey, onSelect, onShare, onHistoryLoaded, onDelete, onError } = props;
  const [history, setHistory] = React.useState<IAiChatHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [renameChatId, setRenameChatId] = React.useState<string>();
  const [renameTitle, setRenameTitle] = React.useState('');
  const [openActionChatId, setOpenActionChatId] = React.useState<string>();

  const loadHistory = React.useCallback(async () => {
    setLoading(true);
    try {
      const historyItems = await getChatHistory();
      setHistory(historyItems ?? []);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('load history failed'));
    } finally {
      setLoading(false);
    }
  }, [onError]);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshKey]);

  React.useEffect(() => {
    onHistoryLoaded?.(history);
  }, [history, onHistoryLoaded]);

  const handleDelete = React.useCallback(
    async (chat: IAiChatHistoryItem) => {
      try {
        await deleteChat(chat.chat_id);
        setHistory((previous) => previous.filter((item) => item.chat_id !== chat.chat_id));
        onDelete?.(chat);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('delete chat failed'));
      }
    },
    [onDelete, onError],
  );

  const groupedHistory = React.useMemo<IChatHistoryGroup[]>(() => {
    const nextGroups: IChatHistoryGroup[] = [];
    const normalizedSearchValue = searchValue.trim().toLowerCase();
    const filteredHistory = normalizedSearchValue ? history.filter((chat) => chat.title.toLowerCase().includes(normalizedSearchValue)) : history;
    const sortedHistory = [...filteredHistory].sort((left, right) => (right.last_update || 0) - (left.last_update || 0));

    sortedHistory.forEach((chat) => {
      const label = getHistoryGroupLabel(chat.last_update, t);
      const key = chat.last_update ? moment.unix(chat.last_update).startOf('day').format('YYYY-MM-DD') : 'unknown';
      const lastGroup = nextGroups[nextGroups.length - 1];

      if (!lastGroup || lastGroup.key !== key) {
        nextGroups.push({
          key,
          label,
          items: [chat],
        });
        return;
      }

      lastGroup.items.push(chat);
    });

    return nextGroups;
  }, [history, searchValue, t]);

  const handleShare = React.useCallback(
    (chat: IAiChatHistoryItem) => {
      if (onShare) {
        onShare(chat);
        return;
      }
      copyAiChatShareUrl(buildAiChatShareUrl(chat.chat_id), t('toolbar.share_copied'));
    },
    [onShare, t],
  );

  const handleRename = React.useCallback(
    async (chat: IAiChatHistoryItem) => {
      const nextTitle = renameTitle.trim();
      if (!nextTitle || nextTitle === chat.title) {
        setRenameChatId(undefined);
        return;
      }

      const previousTitle = chat.title;
      setHistory((previous) => previous.map((item) => (item.chat_id === chat.chat_id ? { ...item, title: nextTitle } : item)));
      setRenameChatId(undefined);
      try {
        await renameChat({ chat_id: chat.chat_id, title: nextTitle });
      } catch (error) {
        setHistory((previous) => previous.map((item) => (item.chat_id === chat.chat_id ? { ...item, title: previousTitle } : item)));
        onError?.(error instanceof Error ? error : new Error('rename chat failed'));
      }
    },
    [onError, renameTitle],
  );

  return (
    <div className='flex h-full min-h-0 w-full flex-col'>
      {searchable && (
        <Input
          allowClear
          className='mb-2'
          placeholder={t('history.search_placeholder')}
          prefix={<Search size={14} className='text-hint' />}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
      )}
      <div className='best-looking-scroll min-h-0 flex-1 py-2'>
        <Spin spinning={loading}>
          {groupedHistory.length ? (
            <div className={cn('flex flex-col', compact ? 'gap-2' : 'gap-4')}>
              {groupedHistory.map((group) => {
                return (
                  <section key={group.key}>
                    <div className={cn('px-2 font-medium text-soft', compact ? 'pb-1 text-sm' : 'text-base')}>{group.label}</div>
                    <div className='overflow-hidden'>
                      {group.items.map((chat, index) => {
                        const isSelected = selectedChatId === chat.chat_id;
                        const itemTitle = chat.title || t('history.untitled');

                        return (
                          <div
                            key={chat.chat_id}
                            className={cn(
                              'group flex cursor-pointer items-center transition-colors',
                              compact ? 'gap-2 px-2 py-1.5' : 'gap-3 px-3 py-3',
                              !compact && index !== group.items.length - 1 && 'border-b border-fc-200',
                            )}
                            onClick={() => onSelect(chat)}
                          >
                            <div className={cn('w-[2px] h-[16px] rounded-3xl group-hover:bg-primary/30', isSelected && 'bg-primary')} />
                            <div
                              className={cn(
                                'flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-md text-soft group-hover:text-main',
                                isSelected && 'text-primary bg-primary/10',
                              )}
                            >
                              <MessageSquare size={16} />
                            </div>

                            <div className='min-w-0 flex-1'>
                              {renameChatId === chat.chat_id ? (
                                <Input
                                  autoFocus
                                  size='small'
                                  value={renameTitle}
                                  onBlur={() => handleRename(chat)}
                                  onChange={(event) => setRenameTitle(event.target.value)}
                                  onClick={(event) => event.stopPropagation()}
                                  onPressEnter={(event) => {
                                    event.stopPropagation();
                                    handleRename(chat);
                                  }}
                                />
                              ) : compact ? (
                                <Popover
                                  content={
                                    <div className='max-w-96'>
                                      <div className='break-words'>{itemTitle}</div>
                                      <div className='mt-0.5 text-hint'>{formatHistoryItemTooltipTime(chat.last_update, t)}</div>
                                    </div>
                                  }
                                  mouseEnterDelay={0.2}
                                  placement='topLeft'
                                  trigger='hover'
                                >
                                  <div className='truncate font-normal text-title'>{itemTitle}</div>
                                </Popover>
                              ) : (
                                <div className='truncate font-normal text-title'>{itemTitle}</div>
                              )}
                            </div>

                            {compact && showActions ? (
                              <div className='ml-1 flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100' onClick={(event) => event.stopPropagation()}>
                                <Dropdown
                                  overlay={
                                    <Menu
                                      items={[
                                        { key: 'rename', icon: <Edit3 size={14} />, label: t('history.rename') },
                                        { key: 'share', icon: <Share2 size={14} />, label: t('history.share') },
                                      ]}
                                      onClick={({ key, domEvent }) => {
                                        domEvent.stopPropagation();
                                        setOpenActionChatId(undefined);
                                        if (key === 'rename') {
                                          setRenameChatId(chat.chat_id);
                                          setRenameTitle(chat.title);
                                          return;
                                        }
                                        handleShare(chat);
                                      }}
                                    />
                                  }
                                  trigger={['click']}
                                  visible={openActionChatId === chat.chat_id}
                                  onVisibleChange={(visible) => setOpenActionChatId(visible ? chat.chat_id : undefined)}
                                >
                                  <Button
                                    aria-label={t('history.more_actions')}
                                    className='flex items-center justify-center text-hint hover:bg-fc-200 hover:text-title'
                                    icon={<MoreVertical size={16} />}
                                    size='small'
                                    type='text'
                                  />
                                </Dropdown>
                              </div>
                            ) : (
                              <div className={cn('flex shrink-0 items-center gap-2', compact ? 'ml-2' : 'ml-4')}>
                                <div className='font-normal text-hint'>{formatHistoryItemTime(chat.last_update, t)}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className='flex h-full items-center justify-center rounded-3xl border border-dashed border-fc-200 bg-fc-50'>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('history.empty')} />
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
}
