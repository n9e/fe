import React, { useState } from 'react';
import { DownOutlined, RightOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface Props {
  thinking: string;
  isStreaming?: boolean;
}

export default function ThinkingBlock({ thinking, isStreaming }: Props) {
  const { t } = useTranslation('AICopilot');
  const [expanded, setExpanded] = useState(false);

  if (!thinking) return null;

  return (
    <div className='ai-copilot-thinking'>
      <div className='ai-copilot-thinking-header' onClick={() => setExpanded(!expanded)}>
        {expanded ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
        <span className='ai-copilot-thinking-label'>
          {isStreaming ? <LoadingOutlined style={{ marginRight: 4 }} /> : null}
          {t('thinking')}
        </span>
      </div>
      {expanded && thinking && <div className='ai-copilot-thinking-content'>{thinking}</div>}
    </div>
  );
}
