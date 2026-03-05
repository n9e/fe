import React from 'react';
import { Tooltip, Button } from 'antd';
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

export default function CopilotButton({ datasourceCate, onClick }: Props) {
  const { t } = useTranslation('AICopilot');

  if (!datasourceCate || !SUPPORTED_DATASOURCE_TYPES.includes(datasourceCate)) {
    return null;
  }

  return (
    <Tooltip title={t('tooltip')}>
      <Button icon={<Icon component={SparklesSvg} style={{ color: 'var(--fc-primary-color)' }} />} onClick={onClick} />
    </Tooltip>
  );
}
