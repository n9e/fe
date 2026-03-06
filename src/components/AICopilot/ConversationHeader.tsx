import React, { useState, useEffect, useMemo } from 'react';
import { Dropdown, Input, Empty, Popconfirm } from 'antd';
import { PlusOutlined, CloseOutlined, SearchOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { AIConversation } from './types';
import { getConversations, deleteConversation } from './services';

interface Props {
  currentId?: number;
  onSelect: (conv: AIConversation) => void;
  onNew: () => void;
  onClose: () => void;
  refreshKey?: number;
}

function groupByDate(conversations: AIConversation[], t: (key: string) => string) {
  const now = dayjs();
  const groups: { label: string; items: AIConversation[] }[] = [];
  const map = new Map<string, AIConversation[]>();

  for (const conv of conversations) {
    const d = dayjs.unix(conv.updated_at);
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
    map.get(label)!.push(conv);
  }

  map.forEach((items, label) => {
    groups.push({ label, items });
  });

  return groups;
}

export default function ConversationHeader({ currentId, onSelect, onNew, onClose, refreshKey }: Props) {
  const { t } = useTranslation('AICopilot');
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const fetchConversations = () => {
    getConversations()
      .then((res) => {
        setConversations(res?.dat || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchConversations();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, search]);

  const groups = useMemo(() => groupByDate(filtered, t), [filtered, t]);

  const currentConv = conversations.find((c) => c.id === currentId);
  const displayTitle = currentConv ? currentConv.title : t('conversation.new');

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteConversation(id).then(() => {
      fetchConversations();
      if (id === currentId) {
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
              {group.items.map((conv) => (
                <div
                  key={conv.id}
                  className={`ai-copilot-conv-item ${conv.id === currentId ? 'active' : ''}`}
                  onClick={() => {
                    onSelect(conv);
                    setOpen(false);
                  }}
                >
                  <span className='ai-copilot-conv-item-title'>{conv.title}</span>
                  <Popconfirm
                    title={t('conversation.delete_confirm')}
                    onConfirm={(e) => {
                      handleDelete(e as any, conv.id);
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
