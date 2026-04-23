import React from 'react';
import { Button } from 'antd';
import { useLocation } from 'react-router-dom';
import type { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useTranslation } from 'react-i18next';

import { IS_ENT } from '@/utils/constant';

import { useAiChatContext } from './context';
import { buildPageFrom, getCurrentPageUrl, getRecommendByUrl } from './recommend';
import { IAiChatPageInfo, IAiChatAction, AiChatExecuteQueryForQueryContent } from './types';

const FLASH_AI_BUTTON_PATH_WHITELIST = new Set(['/alert-rules', '/dashboards', '/alert-cur-events', '/alert-his-events']);

export default function FlashAiButton() {
  const { i18n } = useTranslation();
  const { openAiChat } = useAiChatContext();
  const location = useLocation();

  if (!FLASH_AI_BUTTON_PATH_WHITELIST.has(location.pathname)) {
    return null;
  }

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

export function AiButton(props: {
  size?: SizeType;
  queryPageFrom?: IAiChatPageInfo;
  queryAction?: IAiChatAction;
  promptList?: string[];
  onExecuteQueryForQueryContent?: AiChatExecuteQueryForQueryContent;
}) {
  const { openAiChat } = useAiChatContext();
  const { size, queryPageFrom, queryAction, promptList, onExecuteQueryForQueryContent } = props;

  if (IS_ENT) {
    return (
      <Button
        icon={<img src='/image/ai-chat/ai.gif' className='w-[14px] h-[14px] mb-1' />}
        size={size}
        onClick={() => {
          // flashcat 版本逻辑
        }}
      />
    );
  }

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
