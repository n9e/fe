import React, { useState, useEffect, useMemo } from 'react';
import { Dropdown, Input, Empty, Popconfirm } from 'antd';
import { PlusOutlined, CloseOutlined, SearchOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { AssistantChat } from './types';
import { getChatHistory, deleteChat } from './services';

interface Props {
  currentId?: string;
  onSelect: (chat: AssistantChat) => void;
  onNew: () => void;
  onClose: () => void;
  refreshKey?: number;
}

function groupByDate(chats: AssistantChat[], t: (key: string) => string) {
  const now = dayjs();
  const groups: { label: string; items: AssistantChat[] }[] = [];
  const map = new Map<string, AssistantChat[]>();

  for (const chat of chats) {
    const d = dayjs.unix(chat.last_update);
    let label: string;
    if (d.isSame(now, 'day')) {
      label = t('conversation.today');
    } else if (d.isSame(now.subtract(1, 'day'), 'day')) {
      label = t('conversation.yesterday');
    } else if (d.isSame(now, 'week')) {
      label = t('conversation.this_week');
    } else if (d.isSame(now, 'month')) {
      label = t('conversation.this_month');
    } else {
      label = d.format('YYYY-MM');
    }
    if (!map.has(label)) {
      map.set(label, []);
    }
    map.get(label)!.push(chat);
  }

  map.forEach((items, label) => {
    groups.push({ label, items });
  });

  return groups;
}

export default function ConversationHeader({ currentId, onSelect, onNew, onClose, refreshKey }: Props) {
  const { t } = useTranslation('AICopilot');
  const [chats, setChats] = useState<AssistantChat[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const fetchChats = () => {
    getChatHistory()
      .then((res) => {
        setChats(res?.dat || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchChats();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    if (!search.trim()) return chats;
    const q = search.toLowerCase();
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [chats, search]);

  const groups = useMemo(() => groupByDate(filtered, t), [filtered, t]);

  const currentChat = chats.find((c) => c.chat_id === currentId);
  const displayTitle = currentChat ? currentChat.title : t('conversation.new');

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId).then(() => {
      fetchChats();
      if (chatId === currentId) {
        onNew();
      }
    });
  };

  const dropdownContent = (
    <div className='ai-copilot-conv-dropdown'>
      <div className='ai-copilot-conv-search'>
        <Input size='small' prefix={<SearchOutlined />} placeholder={t('conversation.search')} value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
      </div>
      <div className='ai-copilot-conv-list'>
        {groups.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('conversation.no_conversations')} />
        ) : (
          groups.map((group) => (
            <div key={group.label} className='ai-copilot-conv-group'>
              <div className='ai-copilot-conv-group-label'>{group.label}</div>
              {group.items.map((chat) => (
                <div
                  key={chat.chat_id}
                  className={`ai-copilot-conv-item ${chat.chat_id === currentId ? 'active' : ''}`}
                  onClick={() => {
                    onSelect(chat);
                    setOpen(false);
                  }}
                >
                  <span className='ai-copilot-conv-item-title'>{chat.title}</span>
                  <Popconfirm
                    title={t('conversation.delete_confirm')}
                    onConfirm={(e) => {
                      handleDelete(e as any, chat.chat_id);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                    okText={t('conversation.delete_ok')}
                    cancelText={t('conversation.delete_cancel')}
                  >
                    <DeleteOutlined
                      className='ai-copilot-conv-item-delete'
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </Popconfirm>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className='ai-copilot-sidebar-header'>
      <div className='ai-copilot-header-left'>
        <Dropdown overlay={dropdownContent} trigger={['click']} visible={open} onVisibleChange={setOpen} placement='bottomLeft'>
          <div className='ai-copilot-conv-trigger'>
            <span className='ai-copilot-conv-trigger-title'>{displayTitle}</span>
            <DownOutlined className='ai-copilot-conv-trigger-arrow' />
          </div>
        </Dropdown>
      </div>
      <div className='ai-copilot-header-right'>
        <PlusOutlined
          className='ai-copilot-header-btn'
          title={t('conversation.new')}
          onClick={() => {
            onNew();
            setOpen(false);
          }}
        />
        <CloseOutlined className='ai-copilot-header-btn' onClick={onClose} />
      </div>
    </div>
  );
}
