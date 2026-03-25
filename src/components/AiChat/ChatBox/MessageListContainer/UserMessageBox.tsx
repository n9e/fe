import React, { useState } from 'react';
import { Button, message, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { addPrompt } from '../../services';
import { deletePrompt } from '../../services';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import IconFont from '@/components/IconFont';
import { copy2ClipBoard } from '@/utils';
import { IMessageDetail } from '../../store';

interface IProps {
  messageDetail: IMessageDetail;
  setPromptList: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function UserMessageBox(props: IProps) {
  const { t } = useTranslation('aiChat');
  const { messageDetail, setPromptList } = props;

  const [collectLoading, setCollectLoading] = useState<boolean>(false);
  const [isCollected, setIsCollected] = useState<boolean>(false);

  const collectMessage = (text: string) => {
    setCollectLoading(true);
    addPrompt({
      prompt: text,
    })
      .then((res) => {
        message.success(t('messageList.collectSuccess'));
        setPromptList((old) => {
          if (old?.includes(text)) {
            return old;
          }
          return [...old, text];
        });
        setIsCollected(true);
      })
      .finally(() => {
        setCollectLoading(false);
      });
  };

  const delCollect = (prompt: string) => {
    deletePrompt({ prompt }).then((res) => {
      message.success(t('userInput.delPromptSuccess'));
      setPromptList((old) => {
        const newList = [...old];
        const index = newList.findIndex((el) => el === prompt);
        if (index !== -1) {
          newList.splice(index, 1);
        }
        return newList;
      });
      setIsCollected(false);
    });
  };
  return (
    <div className='user-message-box'>
      <div className='message-text'>{messageDetail.query.content}</div>
      <div className='message-icon'>
        <Tooltip title={t('messageList.collect')}>
          <Button
            size='small'
            type='text'
            loading={collectLoading}
            icon={isCollected ? <HeartFilled /> : <HeartOutlined />}
            onClick={() => {
              if (isCollected) {
                delCollect(messageDetail.query.content);
              } else {
                collectMessage(messageDetail.query.content);
              }
            }}
          ></Button>
        </Tooltip>
        <Tooltip title={t('messageList.copy')}>
          <Button
            size='small'
            type='text'
            icon={<IconFont type='icon-ic_copy' />}
            onClick={() => {
              copy2ClipBoard(messageDetail.query.content);
            }}
          ></Button>
        </Tooltip>
      </div>
    </div>
  );
}
