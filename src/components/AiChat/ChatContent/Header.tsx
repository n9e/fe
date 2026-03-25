import { CloseOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMode } from '../config';
import DocumentDrawer from '@/components/DocumentDrawer';
import IconFont from '@/components/IconFont';
import { IHiddenFeature, IMessageDetail } from '../store';

interface IProps {
  mode: EMode;
  onClose?: () => void;
  fullDrawer?: boolean;
  setFullDrawer?: (fullDrawer: boolean) => void;
  modeChange: (newMode: EMode) => void;
  messageList: IMessageDetail[] | undefined;
  hiddenFeature?: IHiddenFeature;
}

export default function Header(props) {
  const { t } = useTranslation('aiChat');
  const { mode, onClose, fullDrawer, setFullDrawer, modeChange, messageList, hiddenFeature } = props;

  const [fullTooltipVisible, setFullTooltipVisible] = useState(false);

  const getTitle = () => {
    switch (mode) {
      case EMode.KnowledgeBaseAdd:
        return t('header.addKnowledge');
      case EMode.KnowledgeBaseEdit:
        return t('header.editKnowledge');
      default:
        return 'FlashAI';
    }
  };

  return (
    <div className='ai-chat-header'>
      <div className='ai-chat-header-title'>
        <div className='drawer-title-left'>
          {!hiddenFeature?.fullScreen && (
            <div
              className='drawer-full-icon'
              onClick={() => {
                setFullTooltipVisible(false);
                setFullDrawer?.(!fullDrawer);
              }}
            >
              <Tooltip
                title={fullDrawer ? t('header.foldScreen') : t('header.fullScreen')}
                visible={fullTooltipVisible}
                onVisibleChange={(v) => {
                  setFullTooltipVisible(v);
                }}
              >
                {!fullDrawer ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              </Tooltip>
            </div>
          )}
          <div className='title-text'>
            {getTitle()}
            <Button
              type='link'
              icon={<IconFont type='icon-ic_book_one' />}
              onClick={() =>
                DocumentDrawer({
                  zIndex: 1002,
                  title: t('common:page_help'),
                  type: 'iframe',
                  documentPath: mode === 'knowledge_base' ? '/docs/content/flashcat/flashai/what-is-knowledge-base/' : '/docs/content/flashcat/flashai/what-is-flashai/',
                })
              }
            >
              {t('translation:说明文档')}
            </Button>
          </div>
        </div>
        <div className='drawer-title-right'>
          <Space size={8}>
            {/* <Button
                  type='text'
                  size='small'
                  style={{ height: '22px' }}
                  onClick={() => {
                    cleanChat();
                  }}
                >
                  测试用清空会话历史
                </Button> */}
            {![EMode.CurrentChat, EMode.NewChat].includes(mode) && (
              <Button
                type='primary'
                size='small'
                style={{ height: '22px' }}
                onClick={() => {
                  modeChange(messageList?.length > 0 ? EMode.CurrentChat : EMode.NewChat);
                }}
              >
                {t('header.currentSession')}
              </Button>
            )}
            <Tooltip title={t('header.newIcon')}>
              <Button
                type='text'
                size='small'
                onClick={() => {
                  modeChange(EMode.NewChat);
                }}
                icon={<PlusOutlined />}
              />
            </Tooltip>
            {!hiddenFeature?.chatHistory && (
              <Tooltip title={t('header.historyIcon')}>
                <Button
                  type='text'
                  size='small'
                  onClick={() => {
                    modeChange(EMode.ChatHistory);
                  }}
                  icon={<IconFont type='icon-ic_chat_history' />}
                />
              </Tooltip>
            )}
            {!hiddenFeature?.knowledgeBase && (
              <Tooltip title={t('header.knowledgeIcon')}>
                <Button
                  type='text'
                  size='small'
                  onClick={() => {
                    modeChange(EMode.KnowledgeBase);
                  }}
                  icon={<IconFont type='icon-ic_knowledge_base' />}
                />
              </Tooltip>
            )}

            {!hiddenFeature?.closeIcon && (
              <Tooltip title={t('header.close')}>
                <Button
                  type='text'
                  size='small'
                  onClick={() => {
                    onClose?.();
                  }}
                  icon={<CloseOutlined />}
                />
              </Tooltip>
            )}
          </Space>
        </div>
      </div>
    </div>
  );
}
