import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ChatPanel from './ChatPanel';
import './style.less';

interface Props {
  visible: boolean;
  onClose: () => void;
  datasourceType: string;
  datasourceId: number;
  databaseName?: string;
  tableName?: string;
  onApplyQuery?: (query: string) => void;
}

export { default as CopilotButton } from './CopilotButton';

export default function AICopilot({ visible, onClose, datasourceType, datasourceId, databaseName, tableName, onApplyQuery }: Props) {
  const { t } = useTranslation('AICopilot');

  if (!visible) return null;

  return (
    <div className='ai-copilot-sidebar'>
      <div className='ai-copilot-sidebar-header'>
        <span className='ai-copilot-sidebar-title'>{t('title')}</span>
        <CloseOutlined className='ai-copilot-sidebar-close' onClick={onClose} />
      </div>
      <ChatPanel datasourceType={datasourceType} datasourceId={datasourceId} databaseName={databaseName} tableName={tableName} onApplyQuery={onApplyQuery} />
    </div>
  );
}
