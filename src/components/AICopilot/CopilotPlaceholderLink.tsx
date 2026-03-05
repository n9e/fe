import React from 'react';
import Icon from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_DATASOURCE_TYPES } from './types';

const SparklesSvg = () => (
  <svg viewBox='0 0 24 24' fill='currentColor' width='1em' height='1em'>
    <path d='M10 2L12.4 8.2L19 10L12.4 11.8L10 18L7.6 11.8L1 10L7.6 8.2L10 2Z' />
    <path d='M18 14L19.2 17.2L22.5 18L19.2 18.8L18 22L16.8 18.8L13.5 18L16.8 17.2L18 14Z' />
  </svg>
);

interface Props {
  datasourceCate?: string;
  onClick?: () => void;
}

export default function CopilotPlaceholderLink({ datasourceCate, onClick }: Props) {
  const { t } = useTranslation('AICopilot');

  if (!datasourceCate || !SUPPORTED_DATASOURCE_TYPES.includes(datasourceCate)) {
    return null;
  }

  return (
    <span className='ai-copilot-placeholder-inline'>
      <span className='ai-copilot-placeholder-inline-text'>{t('placeholder_prefix')}</span>
      <span className='ai-copilot-placeholder-link' onClick={onClick}>
        <Icon component={SparklesSvg} style={{ marginRight: 3 }} />
        {t('use')}
      </span>
    </span>
  );
}
