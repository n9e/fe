import React, { useState } from 'react';
import { IMessageResponse } from '../../store';
import MarkdownContainer from './MarkdownContainer';
import { useTranslation } from 'react-i18next';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

interface IPorps {
  response: IMessageResponse;
  isCancel: boolean;
  maybeScrollToBottom: () => void;
}

export default function Thinking(props: IPorps) {
  const { t } = useTranslation('aiChat');
  const { response, isCancel, maybeScrollToBottom } = props;

  const [isFold, setisFold] = useState<boolean>(true);

  const foldChange = () => {
    setisFold(!isFold);
  };
  return (
    <div className='thinking-box'>
      <div className='thinking-title'>
        <span onClick={foldChange} style={{ marginRight: 4 }}>
          {isFold ? <RightOutlined /> : <DownOutlined />}
        </span>
        <span style={{ marginRight: 8 }}>{t('messageList.thinking.title')}</span>
        {!response?.is_finish && (
          <div className='message-status'>
            <img src='/image/ai-chat/ai_loading.svg' alt='' className='status-icon' />
            {/* <span className='status-text'>{messageDetail?.cur_step}</span> */}
          </div>
        )}
      </div>
      <div style={{ display: isFold ? 'none' : 'block' }}>
        <MarkdownContainer response={response} isCancel={isCancel} maybeScrollToBottom={maybeScrollToBottom} />
      </div>
    </div>
  );
}
