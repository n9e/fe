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

function useFlashAiClickHandler() {
  const { i18n } = useTranslation();
  const { openAiChat } = useAiChatContext();

  return React.useCallback(() => {
    const url = getCurrentPageUrl();
    const recommend = getRecommendByUrl(url, i18n.language);
    openAiChat({
      queryPageFrom: buildPageFrom({ url }),
      queryAction: recommend?.queryAction,
      promptList: recommend?.promptList,
    });
  }, [i18n, openAiChat]);
}

function useAiEntClickHandler(options?: {
  onExecuteQueryForQueryContent?: AiChatExecuteQueryForQueryContent;
  promptList?: string[];
  queryPageFrom?: IAiChatPageInfo;
  queryAction?: IAiChatAction;
}) {
  const [, setAiChatVisible] = useAiChatVisible();
  const [, setAiHandleEvent] = useAiHandleEvent();
  const [, setAiExternalConfig] = useAiExternalConfig();
  const [, setParamsAiAction] = useParamsAiAction();

  const { onExecuteQueryForQueryContent, promptList, queryPageFrom, queryAction } = options ?? {};

  return React.useCallback(() => {
    setAiChatVisible(true);
    setAiHandleEvent({ onExecuteQueryForQueryContent });
    setAiExternalConfig({ promptList });
    setParamsAiAction({
      page: EPageType.Custom,
      custom: {
        ...queryPageFrom,
        ...queryAction,
      } as any,
    });
  }, [setAiChatVisible, setAiHandleEvent, setAiExternalConfig, setParamsAiAction, onExecuteQueryForQueryContent, promptList, queryPageFrom, queryAction]);
}

function FlashAiButtonContent() {
  const handleClick = useFlashAiClickHandler();

  return (
    <Button
      className='border-violet-600 text-violet-1100 bg-violet-300 hover:border-violet-700 hover:bg-violet-400'
      icon={<img src='/image/ai-chat/ai.gif' className='w-[14px] h-[14px] mr-2' />}
      size='small'
      onClick={handleClick}
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

  const handleEntClick = useAiEntClickHandler({ onExecuteQueryForQueryContent, promptList, queryPageFrom, queryAction });

  if (IS_ENT) {
    return (
      <Button icon={<img src='/image/ai-chat/ai.gif' className={`w-[14px] h-[14px] mb-1 ${children ? 'mr-2' : ''}`} />} size={size} onClick={handleEntClick}>
        {children}
      </Button>
    );
  }

  return <AiButtonContent {...props} />;
}

export function CustomAiButtonWrap({
  children,
  queryAction,
  queryPageFrom,
  promptList,
  onExecuteQueryForQueryContent,
  ...rest
}: // 这里 any 是因为作为 Wrap 会接受很多未知的 props，暂时不想一个个列举
{ children: React.ReactElement } & Record<string, any>) {
  if (IS_ENT) {
    const handleEntClick = useAiEntClickHandler({ queryAction, queryPageFrom, promptList, onExecuteQueryForQueryContent });

    return <span {...rest}>{React.cloneElement(children, { onClick: handleEntClick } as any)}</span>;
  }

  const handleClick = useFlashAiClickHandler();

  return <span {...rest}>{React.cloneElement(children, { onClick: handleClick } as any)}</span>;
}
