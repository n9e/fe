import React from 'react';

import aiChatIcon from '@/components/AiChat/images/ai-chat/ai_chat_icon.svg';

// Matches the floating `.ai-chat-btn`: round clip, gif 2px larger so the soft edge is cropped, logo SVG centered on top.
export default function AiCircleIcon({ size = 32 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size }} className='relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full align-middle'>
      <img
        src={aiChatIcon}
        alt=''
        style={{ width: size / 2, height: size / 2 }}
        className='pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2'
      />
      <img
        src='/image/ai-chat/ai.gif'
        alt=''
        style={{ width: size + 2, height: size + 2 }}
        className='pointer-events-none block max-w-none shrink-0 rounded-full transition-all duration-300 ease-in-out [clip-path:circle(50%_at_50%_50%)] [box-shadow:inset_0_0_0_1px_#0000008c]'
      />
    </span>
  );
}
