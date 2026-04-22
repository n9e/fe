import React from 'react';
import { Empty, Spin } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';

import { deleteChat, getChatHistory } from './services';
import { IAiChatHistoryItem } from './types';
import { cn } from './utils';

interface IChatHistoryPageProps {
  selectedChatId?: string;
  onSelect: (chat: IAiChatHistoryItem) => void;
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

export default function ChatHistory(props: IChatHistoryPageProps) {
  const { t } = useTranslation('AiChat');
  const { selectedChatId, onSelect, onDelete, onError } = props;
  const [history, setHistory] = React.useState<IAiChatHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);

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
  }, [loadHistory]);

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
    const sortedHistory = [...history].sort((left, right) => (right.last_update || 0) - (left.last_update || 0));

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
  }, [history, t]);

  return (
    <div className='flex h-full min-h-0 w-full flex-col'>
      <div className='best-looking-scroll min-h-0 flex-1 py-2'>
        <Spin spinning={loading}>
          {history?.length ? (
            <div className='flex flex-col gap-4'>
              {groupedHistory.map((group) => {
                return (
                  <section key={group.key}>
                    <div className='px-2 text-base font-medium text-soft'>{group.label}</div>
                    <div className='overflow-hidden'>
                      {group.items.map((chat, index) => {
                        const isSelected = selectedChatId === chat.chat_id;

                        return (
                          <div
                            key={chat.chat_id}
                            className={cn('group flex cursor-pointer items-center gap-3 px-3 py-3 transition-colors', index !== group.items.length - 1 && 'border-b border-fc-200')}
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
                              <div className='truncate font-normal text-title'>{chat.title || t('history.untitled')}</div>
                            </div>

                            <div className='ml-4 flex shrink-0 items-center gap-2'>
                              <div className='font-normal text-hint'>{formatHistoryItemTime(chat.last_update, t)}</div>
                              {/* <Popconfirm
                                title={<span className='whitespace-nowrap'>{t('history.delete_confirm')}</span>}
                                overlayStyle={{ minWidth: 220 }}
                                onConfirm={(event) => {
                                  event?.stopPropagation?.();
                                  handleDelete(chat);
                                }}
                              >
                                <Button
                                  size='small'
                                  type='text'
                                  icon={<DeleteOutlined />}
                                  className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-full text-hint transition-all hover:bg-fc-200 hover:text-title',
                                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                                  )}
                                  onClick={(event) => event.stopPropagation()}
                                />
                              </Popconfirm> */}
                            </div>
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
