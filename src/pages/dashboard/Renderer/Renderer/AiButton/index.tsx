import React from 'react';
import { Button, Tooltip } from 'antd';

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
  const style = custom.style === 'icon' || custom.style === 'antd' ? custom.style : 'capsule';
  const label = custom.text?.trim() || DEFAULT_LABEL;
  const prompt = replaceTemplateVariables(typeof custom.prompt === 'string' ? custom.prompt : '', {
    scopedVars: values.scopedVars,
  });
  const openAiChat = useAiChatOpenWithPrompt(prompt, {
    autoExecute: custom.autoExecute === true,
    reuseConversation: custom.reuseConversation === true,
    references: custom.promptReferences,
  });
  const size = custom.size === 'small' || custom.size === 'large' ? custom.size : 'middle';
  const iconSize = size === 'small' ? 24 : size === 'large' ? 40 : 32;
  const buttonType = isAntdButtonType(custom.type) ? custom.type : 'primary';
  const gifIcon = <img src='/image/ai-chat/ai.gif' alt='' className='h-[14px] w-[14px] mr-2' />;

  return (
    <div className='flex h-full w-full items-center justify-center'>
      {style === 'icon' ? (
        <Tooltip title={label}>
          <button
            type='button'
            aria-label={label}
            onClick={openAiChat}
            style={{ width: iconSize, height: iconSize }}
            className='flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0'
          >
            <AiCircleIcon size={iconSize} />
          </button>
        </Tooltip>
      ) : style === 'antd' ? (
        <Button type={buttonType} size={size} onClick={openAiChat}>
          {label}
        </Button>
      ) : (
        <Button
          icon={gifIcon}
          size={size}
          onClick={openAiChat}
          className='!rounded-full border-violet-600 bg-violet-300 text-violet-1100 hover:border-violet-700 hover:bg-violet-400'
        >
          {label}
        </Button>
      )}
    </div>
  );
}
