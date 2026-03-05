import React, { useState } from 'react';
import { Tag } from 'antd';
import { DownOutlined, RightOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ToolCallInfo } from './types';

interface Props {
  thinking: string;
  toolCalls?: ToolCallInfo[];
  isStreaming?: boolean;
}

export default function ThinkingBlock({ thinking, toolCalls, isStreaming }: Props) {
  const { t } = useTranslation('AICopilot');
  const [expanded, setExpanded] = useState(false);

  if (!thinking && (!toolCalls || toolCalls.length === 0)) return null;

  return (
    <div className='ai-copilot-thinking'>
      <div className='ai-copilot-thinking-header' onClick={() => setExpanded(!expanded)}>
        {expanded ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
        <span className='ai-copilot-thinking-label'>
          {isStreaming ? <LoadingOutlined style={{ marginRight: 4 }} /> : null}
          {t('thinking')}
        </span>
        {toolCalls && toolCalls.length > 0 && (
          <span className='ai-copilot-thinking-tools'>
            {toolCalls.map((tc, i) => (
              <Tag key={i} style={{ fontSize: 11 }}>
                {tc.name}
              </Tag>
            ))}
          </span>
        )}
      </div>
      {expanded && thinking && <div className='ai-copilot-thinking-content'>{thinking}</div>}
    </div>
  );
}
