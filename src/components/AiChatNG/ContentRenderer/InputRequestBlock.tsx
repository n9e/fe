import React from 'react';
import { Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '../constants';
import { IAiChatInputRequest } from '../types';
import ContentCard from './ContentCard';

/**
 * The assistant stopped to ask something. Options, when it offered any, send
 * the chosen label as the next message; typing an answer in the box does the
 * same thing by hand.
 */
export default function InputRequestBlock({
  request,
  fallbackQuestion,
  answered,
  onAnswer,
}: {
  request?: IAiChatInputRequest;
  fallbackQuestion?: string;
  /** Once the conversation moved on, the options are history and stay inert. */
  answered?: boolean;
  onAnswer: (text: string) => void;
}) {
  const { t } = useTranslation(NAME_SPACE);
  const question = request?.question?.trim() || fallbackQuestion?.trim();
  if (!question) return null;
  return (
    <ContentCard icon={<QuestionCircleOutlined />} title={t('input_request.title')} bodyClassName='p-3'>
      <div className='text-sm text-main whitespace-pre-wrap'>{question}</div>
      {!!request?.options?.length && (
        <div className='mt-2 flex flex-wrap gap-1.5'>
          {request.options.map((option) => (
            <Button key={option.id || option.label} size='small' disabled={answered} onClick={() => onAnswer(option.label)}>
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </ContentCard>
  );
}
