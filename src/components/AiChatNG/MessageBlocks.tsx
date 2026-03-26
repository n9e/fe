import React from 'react';
import { Button, Collapse } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Markdown from '@/components/Markdown';
import { AiChatCustomContentRenderer, EAiChatContentType, IAiChatAction, IAiChatMessage, IAiChatMessageResponse } from './types';
import { cn } from './utils';

interface IAiChatResponseBlocksProps {
  message: IAiChatMessage;
  isStreaming: boolean;
  customContentRenderer?: AiChatCustomContentRenderer;
  onActionClick: (action: IAiChatAction) => void;
  maybeScrollToBottom?: (behavior?: ScrollBehavior) => void;
}

export function ThinkingBlock({ title, content }: { title: string; content: string }) {
  return (
    <Collapse ghost className='w-full rounded-lg border border-fc-200 bg-fc-50' defaultActiveKey={['thinking']}>
      <Collapse.Panel header={<span className='text-sm font-medium text-main'>{title}</span>} key='thinking'>
        <Markdown content={content || ''} />
      </Collapse.Panel>
    </Collapse>
  );
}

export function HintBlock({ response }: { response: IAiChatMessageResponse }) {
  const { t } = useTranslation('AiChat');

  return (
    <div className='rounded-lg border border-fc-200 bg-fc-100 px-4 py-3'>
      <div className='text-sm font-medium text-title'>{response.hint_text || t('message.hint')}</div>
      <div className='mt-1 text-sm text-main'>{response.content}</div>
    </div>
  );
}

export function MarkdownBlock({ response }: { response: IAiChatMessageResponse }) {
  return (
    <div className='rounded-lg border border-transparent bg-transparent text-main'>
      <Markdown content={response.content || ''} />
    </div>
  );
}

export function CurStepBlock({ curStep }: { curStep: string }) {
  return (
    <div className='mt-1 flex items-center gap-2 py-1.5 text-base text-title'>
      <img src='/image/ai-chat/ai_loading.svg' alt='' aria-hidden='true' className='h-5 w-5 shrink-0 animate-spin' />
      <span className='truncate'>{curStep}</span>
    </div>
  );
}

export function ResponseBlocks(props: IAiChatResponseBlocksProps) {
  const { t } = useTranslation('AiChat');
  const { message, isStreaming, customContentRenderer, onActionClick, maybeScrollToBottom } = props;
  const curStep = message.cur_step?.trim() || t('message.generating');
  const shouldShowCurStep = !message.is_finish && !message.err_code;

  const getActionDisplayLabel = React.useCallback(
    (action: IAiChatAction) => {
      const actionKeyMap: Record<string, string> = {
        query_generator: t('action.query_generator'),
      };

      const datasourceType = action.param?.datasource_type;
      const datasourceId = action.param?.datasource_id;
      const label = actionKeyMap[action.key] || action.key;

      if (datasourceType && datasourceId) {
        return `${label} · ${datasourceType} / ${datasourceId}`;
      }

      if (datasourceType) {
        return `${label} · ${datasourceType}`;
      }

      return label;
    },
    [t],
  );

  if (message.err_code && message.err_code !== 0) {
    return (
      <div className='rounded-lg border border-error/20 bg-error/10 px-4 py-3'>
        <div className='text-sm font-medium text-title'>{message.err_title || (message.err_code === -2 ? t('message.stopped') : t('message.request_failed'))}</div>
        <div className='mt-1 text-sm text-main'>{message.err_msg || (message.err_code === -2 ? t('message.cancelled') : t('message.retry_later'))}</div>
      </div>
    );
  }

  if (!message.response?.length) {
    return shouldShowCurStep ? (
      <CurStepBlock curStep={curStep} />
    ) : (
      <div className='rounded-lg border border-dashed border-fc-200 bg-fc-50 px-4 py-4 text-sm text-hint'>{t('message.empty_response')}</div>
    );
  }

  return (
    <div className='space-y-2.5'>
      {shouldShowCurStep && <CurStepBlock curStep={curStep} />}

      {message.response.map((response, index) => {
        const contentType = response.content_type as EAiChatContentType;

        switch (contentType) {
          case EAiChatContentType.Thinking:
          case EAiChatContentType.Reasoning:
            return <ThinkingBlock key={`${response.content_type}-${index}`} title={t('message.thinking')} content={response.content} />;
          case EAiChatContentType.Markdown:
            return <MarkdownBlock key={`${response.content_type}-${index}`} response={response} />;
          case EAiChatContentType.Hint:
            return <HintBlock key={`${response.content_type}-${index}`} response={response} />;
          default: {
            const customNode = customContentRenderer?.({
              message,
              response,
              isStreaming,
              onExecuteAction: onActionClick,
              maybeScrollToBottom,
            });

            return customNode ? (
              <React.Fragment key={`${response.content_type}-${index}`}>{customNode}</React.Fragment>
            ) : (
              <div key={`${response.content_type}-${index}`} className='rounded-lg border border-dashed border-fc-200 px-4 py-3 text-sm text-hint'>
                {t('message.unsupported_type', { type: response.content_type })}
              </div>
            );
          }
        }
      })}

      {!!message.recommend_action?.length && (
        <div className='flex flex-wrap gap-2'>
          {message.recommend_action.map((action, index) => (
            <Button key={`${action.key}-${index}`} size='small' onClick={() => onActionClick(action)}>
              {getActionDisplayLabel(action)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export function EmptyConversation({ prompts, onPromptClick }: { prompts?: string[]; onPromptClick: (prompt: string) => void }) {
  const { t } = useTranslation('AiChat');

  return (
    <div className='w-full h-full flex flex-col items-center text-center'>
      <div
        className='w-[80%] h-[260px] flex justify-center items-end'
        style={{
          backgroundImage: 'url(/image/ai-chat/ai_chat_background.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className='mb-8 text-l6 font-bold'>
          {t('empty.greeting_prefix')} <span className='text-primary'>FlashAI</span>
        </div>
      </div>
      {prompts?.length ? (
        <div className='w-[60%] mt-4 flex flex-col gap-2'>
          {prompts.map((prompt) => (
            <div
              key={prompt}
              className='w-full h-[32px] cursor-pointer flex items-center justify-between px-2 rounded-lg'
              style={{
                backgroundColor: 'var(--fc-geekblue-1-color)',
              }}
              onClick={() => onPromptClick(prompt)}
            >
              <span className='truncate text-sm text-main'>{prompt}</span>
              <ArrowRightOutlined />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function MessageItem({ message, isStreaming, customContentRenderer, onActionClick, maybeScrollToBottom }: IAiChatResponseBlocksProps) {
  return (
    <div className='w-full space-y-3 shadow-sm'>
      <div className='flex justify-end'>
        <div className='max-w-[85%] rounded-lg bg-primary/10 px-2 py-1 text-sm'>
          <div className='whitespace-pre-wrap break-words'>{message.query.content}</div>
        </div>
      </div>
      <div className={cn('space-y-3', isStreaming ? 'animate-in fade-in-50 duration-300' : '')}>
        <ResponseBlocks
          message={message}
          isStreaming={isStreaming}
          customContentRenderer={customContentRenderer}
          onActionClick={onActionClick}
          maybeScrollToBottom={maybeScrollToBottom}
        />
      </div>
    </div>
  );
}
