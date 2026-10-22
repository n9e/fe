import React from 'react';

import aiChatIcon from '@/components/AiChat/images/ai-chat/ai_chat_icon.svg';

// Matches the floating `.ai-chat-btn`: round clip, gif 2px larger so the soft edge is cropped, logo SVG centered on top.
export default function AiCircleIcon() {
  return (
    <span className='relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full align-middle'>
      <img src={aiChatIcon} alt='' className='pointer-events-none absolute left-1/2 top-1/2 z-[1] h-4 w-4 -translate-x-1/2 -translate-y-1/2' />
      <img
        src='/image/ai-chat/ai.gif'
        alt=''
        className='pointer-events-none block h-[34px] w-[34px] max-w-none shrink-0 rounded-full transition-all duration-300 ease-in-out [clip-path:circle(50%_at_50%_50%)] [box-shadow:inset_0_0_0_1px_#0000008c]'
      />
    </span>
  );
}
