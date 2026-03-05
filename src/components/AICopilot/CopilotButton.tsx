import React from 'react';
import { Tooltip } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_DATASOURCE_TYPES } from './types';

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
      <span className='ai-copilot-trigger' onClick={onClick}>
        <RobotOutlined style={{ marginRight: 4 }} />
        {t('use')}
      </span>
    </Tooltip>
  );
}
