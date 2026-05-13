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

function FlashAiButtonContent() {
  const { i18n } = useTranslation();
  const { openAiChat } = useAiChatContext();

  return (
    <Button
      icon={<img src='/image/ai-chat/ai.gif' className='w-[14px] h-[14px] mr-2 mb-1' />}
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
      FlashAI
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
  onExecuteQueryForQueryContent?: AiChatExecuteQueryForQueryContent;
}) {
  const { openAiChat } = useAiChatContext();
  const { size, queryPageFrom, queryAction, promptList, onExecuteQueryForQueryContent } = props;

  return (
    <Button
      icon={<img src='/image/ai-chat/ai.gif' className='w-[14px] h-[14px] mb-1' />}
      size={size}
      onClick={() => {
        openAiChat({
          queryPageFrom,
          queryAction,
          promptList,
          onExecuteQueryForQueryContent,
        });
      }}
    />
  );
}

export function AiButton(props: {
  size?: SizeType;
  queryPageFrom?: IAiChatPageInfo;
  queryAction?: IAiChatAction;
  promptList?: string[];
  onExecuteQueryForQueryContent?: AiChatExecuteQueryForQueryContent;
}) {
  const { size, queryPageFrom, queryAction, promptList, onExecuteQueryForQueryContent } = props;

  const [aiChatVisible, setAiChatVisible] = useAiChatVisible();
  const [aiHandleEvent, setAiHandleEvent] = useAiHandleEvent();
  const [aiExternalConfig, setAiExternalConfig] = useAiExternalConfig();
  const [paramsAiAction, setParamsAiAction] = useParamsAiAction();

  if (IS_ENT) {
    return (
      <Button
        icon={<img src='/image/ai-chat/ai.gif' className='w-[14px] h-[14px] mb-1' />}
        size={size}
        onClick={() => {
          // flashcat 版本逻辑
          setAiChatVisible(true);
          setAiHandleEvent({ onExecuteQueryForQueryContent });
          setAiExternalConfig({
            promptList,
          });
          setParamsAiAction({
            custom: {
              ...queryPageFrom,
              ...queryAction,
            } as any,
          });
        }}
      />
    );
  }

  return <AiButtonContent {...props} />;
}
