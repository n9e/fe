import React from 'react';
import Markdown from '@/components/Document/Markdown';
import { Button, Spin, Tooltip } from 'antd';
import IconFont from '@/components/IconFont';
import { EContentType, EFeedbackStatus, ICustomMessageRenderer, IMessageDetail, IMessageResponse, IRecommendActionItem } from '@/components/AiChat/store';
import { ArrowRightOutlined } from '@ant-design/icons';
import MarkdownContainer from './MarkdownContainer';
import CheckListContainer from './CheckListContainer';
import { sendMessageFeedback } from '../../services';
import { useTranslation } from 'react-i18next';
import HintContainer from './HintContainer';
import Thinking from './Thinking';

interface IProps {
  messageDetail: IMessageDetail;
  setMessageList: React.Dispatch<React.SetStateAction<IMessageDetail[]>>;
  userSendMessage: (action?: IRecommendActionItem) => void;
  isCancel: boolean;
  maybeScrollToBottom: () => void;
  customMessageRenderer?: React.ComponentType<ICustomMessageRenderer>;
}

export default function AiMessage(props: IProps) {
  const { t } = useTranslation('aiChat');
  const { messageDetail, setMessageList, userSendMessage, isCancel, maybeScrollToBottom, customMessageRenderer } = props;

  const handleFeedback = (status: EFeedbackStatus) => {
    sendMessageFeedback({
      chat_id: messageDetail?.chat_id,
      seq_id: messageDetail?.seq_id,
      status,
    }).then((res) => {
      setMessageList((old) => {
        const index = old?.findIndex((el) => el.chat_id === messageDetail?.chat_id && el.seq_id === messageDetail?.seq_id);
        if (index !== -1) {
          const newList = [...old];
          newList[index] = { ...newList[index], feedback: { ...newList[index].feedback!, status } };
          return newList;
        }
        return old;
      });
    });
  };

  const renderResponse = (response: IMessageResponse) => {
    switch (response.content_type) {
      case EContentType.Thinking:
        return <Thinking response={response} isCancel={isCancel} maybeScrollToBottom={maybeScrollToBottom} />;
      case EContentType.Markdown:
        return <MarkdownContainer response={response} isCancel={isCancel} maybeScrollToBottom={maybeScrollToBottom} />;
      case EContentType.FiremapCheckItem:
        return <CheckListContainer response={response} />;
      case EContentType.Hint:
        return <HintContainer response={response} />;
      default:
        return customMessageRenderer ? React.createElement(customMessageRenderer, { response, isCancel, maybeScrollToBottom }) : null;
    }
  };

  return (
    <div className='ai-message-box'>
      {!messageDetail?.is_finish && (
        <div className='message-status'>
          <img src='/image/ai-chat/ai_loading.svg' alt='' className='status-icon' />
          <span className='status-text'>{messageDetail?.cur_step}</span>
        </div>
      )}

      <div className='ai-message-content'>
        {messageDetail?.err_code !== 0 && !!messageDetail?.is_finish ? (
          <>
            <div className='err-message-box'>
              <div className='err-message-title'>{messageDetail?.err_title}</div>
              <div className='err-message-content'>{messageDetail?.err_msg}</div>
            </div>
          </>
        ) : (
          <>
            {messageDetail?.response?.map((el, index) => {
              return <div key={index}>{renderResponse(el)}</div>;
            })}
          </>
        )}
      </div>
      <div className='ai-recommend-action'>
        {messageDetail?.recommend_action?.map((el, index) => {
          return (
            <div
              className='recommend-action-item'
              key={index}
              onClick={() => {
                userSendMessage(el);
              }}
            >
              <div className='action-text'>{el.content}</div>
              <div className='action-icon'>
                <ArrowRightOutlined />
              </div>
            </div>
          );
        })}
      </div>
      <div className='ai-message-icon'>
        {messageDetail?.is_finish && (
          <>
            <Tooltip title={t('messageList.like')}>
              <Button
                size='small'
                type='text'
                icon={messageDetail?.feedback?.status === EFeedbackStatus.Like ? <IconFont type='icon-ic_like_filled' /> : <IconFont type='icon-ic_like_outlined' />}
                onClick={() => {
                  handleFeedback(EFeedbackStatus.Like);
                }}
              ></Button>
            </Tooltip>
            <Tooltip title={t('messageList.dislike')}>
              <Button
                size='small'
                type='text'
                icon={messageDetail?.feedback?.status === EFeedbackStatus.Dislike ? <IconFont type='icon-ic_dislike_filled' /> : <IconFont type='icon-ic_dislike_outlined' />}
                onClick={() => {
                  handleFeedback(EFeedbackStatus.Dislike);
                }}
              ></Button>
            </Tooltip>
          </>
        )}
      </div>
      {/* <div className='cancel-message-box'>{t('messageList.cancelMessage')}</div> */}
    </div>
  );
}
