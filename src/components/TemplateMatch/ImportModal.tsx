import React from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

import { markDsJourney } from '@/pages/datasource/utils/journey';

import { TplMatchedComponent } from './services';
import ImportPanel from './ImportPanel';

/**
 * 点组件卡片后的导入弹窗（产品方案 A4.9）。
 *
 * 内容全在 ImportPanel 里，这层只负责弹窗外壳与数据源侧的旅程记账 ——
 * 采集配置那条流程也复用同一个面板，但它不该写数据源的旅程标记，所以这类
 * 调用方专属的副作用留在各自的外层，不下沉到面板。
 */

interface Props {
  datasourceId: number;
  entry: TplMatchedComponent;
  show: 'dashboards' | 'alerts' | 'both';
  onClose: () => void;
  onImported?: (type: 'dashboard' | 'alert') => void;
}

export default function ImportModal(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { datasourceId, entry, show, onClose, onImported } = props;

  return (
    <Modal title={t('tpl_match.import_modal_title', { component: entry.component })} visible onCancel={onClose} footer={null} width={560}>
      <ImportPanel
        datasourceId={datasourceId}
        entry={entry}
        show={show}
        onImported={(type) => {
          markDsJourney(datasourceId, type === 'dashboard' ? 'dashboard_created_at' : 'alert_created_at');
          onImported?.(type);
        }}
      />
    </Modal>
  );
}
