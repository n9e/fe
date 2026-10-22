import React, { useContext } from 'react';
import { Button, Tooltip } from 'antd';

import { CommonStateContext } from '@/App';
import { useAiChatOpenWithPrompt } from '@/components/AiChatNG/FlashAiButton';
import AiCircleIcon from '@/pages/dashboard/Components/AiCircleIcon';
import { IS_ENT } from '@/utils/constant';
import replaceTemplateVariables from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import { IAiButtonStyles, IPanel } from '../../../types';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';

interface IProps {
  values: IPanel;
  series: CalculatedSeries[];
  themeMode?: 'dark';
}

const DEFAULT_LABEL = IS_ENT ? 'FlashAI' : 'Nightingale AI';

const ANTD_BUTTON_TYPES = ['primary', 'default', 'dashed', 'text', 'link'] as const;

function isAntdButtonType(value: unknown): value is (typeof ANTD_BUTTON_TYPES)[number] {
  return typeof value === 'string' && (ANTD_BUTTON_TYPES as readonly string[]).includes(value);
}

export default function AiButton(props: IProps) {
  const { values } = props;
  const custom = values.custom as unknown as Partial<IAiButtonStyles>;
  const { aiStatus } = useContext(CommonStateContext) as { aiStatus?: boolean };
  const disabled = IS_ENT && !aiStatus;
  const style = custom.style === 'icon' || custom.style === 'antd' ? custom.style : 'capsule';
  const label = style === 'icon' ? DEFAULT_LABEL : custom.text?.trim() || DEFAULT_LABEL;
  const prompt = replaceTemplateVariables(typeof custom.prompt === 'string' ? custom.prompt : '', {
    scopedVars: values.scopedVars,
  });
  const openAiChat = useAiChatOpenWithPrompt(prompt);
  const buttonType = isAntdButtonType(custom.type) ? custom.type : 'primary';
  const gifIcon = <img src='/image/ai-chat/ai.gif' alt='' className='h-[14px] w-[14px] mr-2' />;

  const handleClick = () => {
    if (disabled) return;
    openAiChat();
  };

  return (
    <div className='flex h-full w-full items-center justify-center'>
      {style === 'icon' ? (
        <Tooltip title={label}>
          <button
            type='button'
            aria-label={label}
            disabled={disabled}
            onClick={handleClick}
            className='flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-40'
          >
            <AiCircleIcon />
          </button>
        </Tooltip>
      ) : style === 'antd' ? (
        <Button type={buttonType} disabled={disabled} onClick={handleClick}>
          {label}
        </Button>
      ) : (
        <Button
          disabled={disabled}
          icon={gifIcon}
          onClick={handleClick}
          className='!rounded-full border-violet-600 bg-violet-300 text-violet-1100 hover:border-violet-700 hover:bg-violet-400'
        >
          {label}
        </Button>
      )}
    </div>
  );
}
