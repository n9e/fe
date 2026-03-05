import React from 'react';
import { Button, message } from 'antd';
import { CopyOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useTranslation } from 'react-i18next';

interface Props {
  query: string;
  explanation?: string;
  language?: string; // promql, sql
  onRunQuery?: (query: string) => void;
}

export default function QueryResultBlock({ query, explanation, language = 'sql', onRunQuery }: Props) {
  const { t } = useTranslation('AICopilot');

  const handleCopy = () => {
    navigator.clipboard.writeText(query).then(() => {
      message.success(t('copied'));
    });
  };

  return (
    <div className='ai-copilot-query-result'>
      <div className='ai-copilot-query-result-code'>
        <SyntaxHighlighter language={language} PreTag='div' customStyle={{ margin: 0, padding: '8px 12px', fontSize: 13, background: 'transparent' }}>
          {query}
        </SyntaxHighlighter>
      </div>
      <div className='ai-copilot-query-result-actions'>
        <Button size='small' icon={<CopyOutlined />} onClick={handleCopy}>
          {t('copy')}
        </Button>
        {onRunQuery && (
          <Button size='small' type='primary' icon={<CaretRightOutlined />} onClick={() => onRunQuery(query)}>
            {t('run_query')}
          </Button>
        )}
      </div>
      {explanation && <div className='ai-copilot-query-result-explanation'>{explanation}</div>}
    </div>
  );
}
