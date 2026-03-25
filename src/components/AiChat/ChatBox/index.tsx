import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InitPage from './InitPage/index';
import UserInput from './UserInput';
import { cancelMessage, getMessageDetail, getPromptList, sendMessage } from '../services';
import { Button, Spin } from 'antd';
import { ApiCreatChat, ICustomMessageRenderer, IMessageDetail, IRecommendActionItem, IHiddenFeature } from '../store';
import MessageListContainer from './MessageListContainer';
import './style.less';
import _ from 'lodash';
import { useRequest } from 'ahooks';
import { EMode } from '../config';
import { useAutoScroll } from '../utils/index';
import { useLocation } from 'react-router-dom';

interface IProps {
  mode: EMode;
  dataSourceList: any[];
  chatDetail?: IMessageDetail;
  pageInfo?: ApiCreatChat;
  messageList: IMessageDetail[];
  setMessageList: React.Dispatch<React.SetStateAction<IMessageDetail[]>>;
  chatBoxLoading: boolean;
  hiddenFeature?: IHiddenFeature;
  customMessageRenderer?: React.ComponentType<ICustomMessageRenderer>;
}

export default forwardRef(function ChatBox(props: IProps, ref) {
  const { t } = useTranslation('aiChat');
  const { mode, dataSourceList, chatDetail, pageInfo, messageList, setMessageList, chatBoxLoading, hiddenFeature, customMessageRenderer } = props;

  const location = useLocation();

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const { maybeScrollToBottom, scrollToBottom } = useAutoScroll(chatBoxRef);

  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  const [defaultModel, setDefaultModel] = useState<any>();
  const [userInput, setUserInput] = useState<string>('');
  const [promptList, setPromptList] = useState<string[]>([]);
  const [isCancel, setIsCancel] = useState<boolean>(false);

  const {
    data: curMessageDetail,
    run,
    cancel,
    refresh,
  } = useRequest(getMessageDetail, {
    manual: true,
    pollingInterval: 3000,
    onBefore: () => {
      // setMessageLoading(true);
      // setIsCancel(false);
    },

    onSuccess: (data) => {
      const tempMessageList = _.cloneDeep(messageList);
      tempMessageList.splice(tempMessageList.length - 1, 1, data);
      setMessageList(tempMessageList);
      if (data?.is_finish) {
        setMessageLoading(false);
        cancel();
        // if (urlQuery?.ai_analysis_mode === EActionKey.SloInspection) {
        //   requestAnimationFrame(() => {
        //     addHiddenElement();
        //   });
        // }
      }
    },
    // onFinally: (params, data, error) => {},
  });

  useEffect(() => {
    if (dataSourceList?.length) {
      const tempModel = dataSourceList?.find((item) => item.is_default);
      setDefaultModel(tempModel || dataSourceList?.[0]);
      getPrompts();
    }
  }, [JSON.stringify(dataSourceList)]);

  useEffect(() => {
    let timeout;
    if (messageList?.length > 0) {
      timeout = setTimeout(() => {
        scrollToBottom('smooth');
      }, 50);
    }
    return () => clearTimeout(timeout);
  }, [JSON.stringify(messageList)]);

  useImperativeHandle(ref, () => ({
    userSendMessage,
  }));

  const userSendMessage = (action?: IRecommendActionItem) => {
    const chat_id = messageList?.[0]?.chat_id ? messageList?.[0]?.chat_id : chatDetail?.chat_id;
    const isHasMessage = !action && !userInput;
    // console.log('messageLoading', messageLoading, userInput, defaultModel, action);
    if (!pageInfo || !chat_id || !defaultModel || messageLoading || isHasMessage) return;

    setMessageLoading(true);
    setIsCancel(false);

    const tempQuery = {
      page_from: pageInfo,
      action,
      content: !!action ? action?.content : userInput,
    };
    sendMessage({
      chat_id,
      model_id: defaultModel?.id,
      query: tempQuery,
    })
      .then((res) => {
        // console.log(res);
        setUserInput('');
        setMessageList([...messageList, { seq_id: res?.seq_id, chat_id, model_id: defaultModel?.id, query: tempQuery }]);

        run({
          chat_id,
          seq_id: res?.seq_id,
        });
      })
      .catch(() => {
        setMessageLoading(false);
      });
  };

  const userCancelMessage = () => {
    const chat_id = messageList?.[0]?.chat_id;
    const seq_id = messageList?.[messageList?.length - 1]?.seq_id;
    cancelMessage({
      chat_id,
      seq_id,
    }).then((res) => {
      // console.log('res', res);
      setMessageList((old) => {
        const newList = _.cloneDeep(old);
        newList[newList.length - 1].is_finish = true;
        return newList;
      });
      setIsCancel(true);
      setMessageLoading(false);
      cancel();
    });
  };

  const getPrompts = () => {
    getPromptList().then((res) => {
      setPromptList(res);
    });
  };

  return (
    <div className='ai-chat-body'>
      <Spin spinning={chatBoxLoading} wrapperClassName='ai-chat-content-spin'>
        <div className='ai-chat-content'>
          <div ref={chatBoxRef} className='chat-box'>
            {!!messageList?.length || mode === EMode.CurrentChat ? (
              <MessageListContainer
                messageList={messageList}
                setMessageList={setMessageList}
                setPromptList={setPromptList}
                userSendMessage={userSendMessage}
                isCancel={isCancel}
                maybeScrollToBottom={maybeScrollToBottom}
                customMessageRenderer={customMessageRenderer}
              />
            ) : (
              <InitPage dataSourceList={dataSourceList} chatDetail={chatDetail} userSendMessage={userSendMessage} />
            )}
          </div>
          {!!dataSourceList?.length && (
            <UserInput
              dataSourceList={dataSourceList}
              defaultModel={defaultModel}
              setDefaultModel={setDefaultModel}
              userInput={userInput}
              setUserInput={setUserInput}
              promptList={promptList}
              setPromptList={setPromptList}
              userSendMessage={userSendMessage}
              userCancelMessage={userCancelMessage}
              messageLoading={messageLoading}
              hiddenFeature={hiddenFeature}
            />
          )}
        </div>
      </Spin>
    </div>
  );
});
