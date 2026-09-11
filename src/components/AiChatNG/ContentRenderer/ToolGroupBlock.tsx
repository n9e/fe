import React from 'react';
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';

import { IAiChatToolCallGroup } from '../types';

/**
 * The steps the assistant took, as the backend named them for a reader
 * ("检索指标名"). The calls themselves stay on the server; what the user
 * needs is to see that work happened, and what kind.
 */
export default function ToolGroupBlock({ group, isFinish }: { group?: IAiChatToolCallGroup; isFinish?: boolean }) {
  const names = (group?.items ?? []).map((item) => item.content?.trim()).filter((name): name is string => !!name);
  if (!names.length) return null;
  return (
    <ol className='m-0 list-none space-y-1 p-0 text-sm text-main'>
      {names.map((name, index) => {
        const running = !isFinish && index === names.length - 1;
        return (
          <li key={`${name}-${index}`} className='flex items-center gap-2'>
            <span className={running ? 'text-primary' : 'text-success'} aria-hidden='true'>
              {running ? <LoadingOutlined spin /> : <CheckOutlined />}
            </span>
            <span>{name}</span>
          </li>
        );
      })}
    </ol>
  );
}
