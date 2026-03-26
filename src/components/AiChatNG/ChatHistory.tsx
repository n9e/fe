import React from 'react';
import { Button, Empty, Popconfirm, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { deleteChat, getChatHistory } from './services';
import { IAiChatHistoryItem } from './types';
import { cn, formatChatTime } from './utils';

interface IChatHistoryPageProps {
  onSelect: (chat: IAiChatHistoryItem) => void;
  onDelete?: (chat: IAiChatHistoryItem) => void;
  onError?: (error: Error) => void;
}

export default function ChatHistory(props: IChatHistoryPageProps) {
  const { t } = useTranslation('AiChat');
  const { onSelect, onDelete, onError } = props;
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

  return (
    <div className='flex w-full h-full min-h-0 flex-col'>
      <div className='min-h-0 flex-1 p-2 best-looking-scroll'>
        <Spin spinning={loading}>
          {history?.length ? (
            <div className='flex flex-col gap-2'>
              {history.map((chat) => {
                return (
                  <div
                    key={chat.chat_id}
                    className={cn('group flex h-8 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 transition-colors bg-fc-200 hover:bg-primary/10')}
                    onClick={() => onSelect(chat)}
                  >
                    <div className='min-w-0 flex-1'>
                      <div className='truncate text-xs font-normal leading-8 text-title'>{chat.title || t('history.untitled')}</div>
                    </div>
                    <div className='flex shrink-0 items-center gap-3'>
                      <div className='text-xs font-normal leading-8 text-hint'>{formatChatTime(chat.last_update)}</div>
                      <Popconfirm title={t('history.delete_confirm')} onConfirm={() => handleDelete(chat)}>
                        <Button
                          size='small'
                          type='text'
                          icon={<DeleteOutlined />}
                          className='flex h-8 w-8 items-center justify-center text-hint opacity-70 transition-opacity hover:opacity-100 group-hover:opacity-100'
                          onClick={(event) => event.stopPropagation()}
                        />
                      </Popconfirm>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='flex h-full items-center justify-center'>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('history.empty')} />
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
}
