import React, { useState } from 'react';
import { Button, message } from 'antd';
import { addPrompt } from '../../services';
import { useTranslation } from 'react-i18next';
import { ICustomMessageRenderer, IMessageDetail, IRecommendActionItem } from '../../store';
import AiMessage from './AiMessage';
import UserMessageBox from './UserMessageBox';

interface IProps {
  messageList: IMessageDetail[];
  setMessageList: (messageList: IMessageDetail[]) => void;
  setPromptList: React.Dispatch<React.SetStateAction<string[]>>;
  userSendMessage: (action?: IRecommendActionItem) => void;
  isCancel: boolean;
  maybeScrollToBottom: () => void;
  customMessageRenderer?: React.ComponentType<ICustomMessageRenderer>;
}

export default function MessageListContainer(props: IProps) {
  const { t } = useTranslation('aiChat');
  const { messageList, setMessageList, setPromptList, userSendMessage, isCancel, maybeScrollToBottom, customMessageRenderer } = props;
  // console.log('messageList', messageList);

  return (
    <div className='message-list-box'>
      {messageList?.map((el, index) => {
        return (
          <div className='message-item' key={index}>
            <UserMessageBox messageDetail={el} setPromptList={setPromptList} />
            <AiMessage
              messageDetail={el}
              setMessageList={setMessageList}
              userSendMessage={userSendMessage}
              isCancel={isCancel}
              maybeScrollToBottom={maybeScrollToBottom}
              customMessageRenderer={customMessageRenderer}
            />
          </div>
        );
      })}
    </div>
  );
}
