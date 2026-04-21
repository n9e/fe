import React, { useContext } from 'react';
import aiChatIcon from '@/components/AiChat/images/ai-chat/ai_chat_icon.svg';
import aiChatGif from '@/components/AiChat/images/ai-chat/ai.gif';
import { Button } from 'antd';
import { CommonStateContext } from '@/App';
import { useAiChatVisible } from '../utils/useHook';

export default function LayoutHeaderAiBtn(props) {
  const {} = props;

  const { aiStatus } = useContext(CommonStateContext as React.Context<any>);
  const [_, setAiChatVisible] = useAiChatVisible();
  return !!aiStatus ? (
    <>
      <Button
        className='layout-header-ai-chat-btn'
        target='_blank'
        icon={
          <span className='ai-chat-btn'>
            {/* <img src={aiChatIcon} className='ai-chat-icon' /> */}
            <img src={aiChatGif} className='ai-chat-gif fc-theme-dark-circle-gif' />
          </span>
        }
        size='small'
        onClick={() => {
          setAiChatVisible(true);
        }}
      >
        FlashAI
      </Button>
    </>
  ) : null;
}
