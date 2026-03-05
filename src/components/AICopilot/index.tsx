import React from 'react';
import { Drawer } from 'antd';
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

  return (
    <Drawer
      title={t('title')}
      placement='right'
      width={480}
      mask={false}
      visible={visible}
      onClose={onClose}
      className='ai-copilot-drawer'
      destroyOnClose
    >
      <ChatPanel datasourceType={datasourceType} datasourceId={datasourceId} databaseName={databaseName} tableName={tableName} onApplyQuery={onApplyQuery} />
    </Drawer>
  );
}
