import React from 'react';
import { Button } from 'antd';
import { useLocation } from 'react-router-dom';

import { useAiChatContext } from './context';
import { buildPageFrom, getCurrentPageUrl, getRecommendByUrl } from './recommend';
import { useTranslation } from 'react-i18next';

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
          callbackParams: {
            openedAt: Date.now(),
          },
        });
      }}
    >
      FlashAI
    </Button>
  );
}
