import React from 'react';
import { Button } from 'antd';
import type { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useTranslation } from 'react-i18next';

import { IS_ENT } from '@/utils/constant';
import LayoutHeaderAiBtn from '@/components/AiChat/AiBtn/LayoutHeaderAiBtn';

import { useAiChatContext } from './context';
import { buildPageFrom, getCurrentPageUrl, getRecommendByUrl } from './recommend';
import { IAiChatPageInfo, IAiChatAction, AiChatExecuteQueryForQueryContent } from './types';
import { useAiChatVisible, useAiExternalConfig, useAiHandleEvent, useParamsAiAction } from '../AiChat/utils/useHook';
import { EPageType } from '../AiChat/config';

function FlashAiButtonContent() {
  const { i18n } = useTranslation();
  const { openAiChat } = useAiChatContext();

  return (
    <Button
      className='border-violet-600 text-violet-1100 bg-violet-300 hover:border-violet-700 hover:bg-violet-400'
      icon={<img src='/image/ai-chat/ai.gif' className='w-[14px] h-[14px] mr-2' />}
      size='small'
      onClick={() => {
        const url = getCurrentPageUrl();
        const recommend = getRecommendByUrl(url, i18n.language);
        openAiChat({
          queryPageFrom: buildPageFrom({ url }),
          queryAction: recommend?.queryAction,
          promptList: recommend?.promptList,
        });
      }}
    >
      Nightingale AI
    </Button>
  );
}

export default function FlashAiButton() {
  if (IS_ENT) {
    return <LayoutHeaderAiBtn />;
  }
  return <FlashAiButtonContent />;
}

function AiButtonContent(props: {
  size?: SizeType;
  queryPageFrom?: IAiChatPageInfo;
  queryAction?: IAiChatAction;
  promptList?: string[];
  initialMessage?: string;
  onExecuteQueryForQueryContent?: AiChatExecuteQueryForQueryContent;
  children?: React.ReactNode;
}) {
  const { openAiChat } = useAiChatContext();
  const { size, queryPageFrom, queryAction, promptList, initialMessage, onExecuteQueryForQueryContent, children } = props;

  return (
    <Button
      icon={<img src='/image/ai-chat/ai.gif' className={`w-[14px] h-[14px] mb-1 ${children ? 'mr-2' : ''}`} />}
      size={size}
      onClick={() => {
        openAiChat({
          queryPageFrom,
          queryAction,
          promptList,
          initialMessage,
          onExecuteQueryForQueryContent,
        });
      }}
    >
      {children}
    </Button>
  );
}

export function AiButton(props: {
  size?: SizeType;
  queryPageFrom?: IAiChatPageInfo;
  queryAction?: IAiChatAction;
  promptList?: string[];
  initialMessage?: string;
  onExecuteQueryForQueryContent?: AiChatExecuteQueryForQueryContent;
  children?: React.ReactNode;
}) {
  const { size, queryPageFrom, queryAction, promptList, initialMessage, onExecuteQueryForQueryContent, children } = props;

  const [aiChatVisible, setAiChatVisible] = useAiChatVisible();
  const [aiHandleEvent, setAiHandleEvent] = useAiHandleEvent();
  const [aiExternalConfig, setAiExternalConfig] = useAiExternalConfig();
  const [paramsAiAction, setParamsAiAction] = useParamsAiAction();

  if (IS_ENT) {
    return (
      <Button
        icon={<img src='/image/ai-chat/ai.gif' className={`w-[14px] h-[14px] mb-1 ${children ? 'mr-2' : ''}`} />}
        size={size}
        onClick={() => {
          // flashcat 版本逻辑
          setAiChatVisible(true);
          setAiHandleEvent({ onExecuteQueryForQueryContent });
          setAiExternalConfig({
            promptList,
          });
          setParamsAiAction({
            page: EPageType.Custom,
            custom: {
              ...queryPageFrom,
              ...queryAction,
            } as any,
          });
        }}
      >
        {children}
      </Button>
    );
  }

  return <AiButtonContent {...props} />;
}
