import React, { useContext, useState } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { ExternalLink, Import } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';

import Export from '@/pages/dashboard/List/Export';
import { getPayloadByUUID } from '../services';
import { formatBeautifyJson } from '../utils';
import ImportDashboard from './Import';

interface Props {
  uuid: number;
}

type Action = 'import' | 'export';

/**
 * 模板仪表盘详情页专属操作。
 *
 * 点击后重新读取原始 payload，确保导入、导出的 JSON 与模板列表操作完全一致，
 * 同时避免将模板中心依赖带入通用仪表盘详情页。
 */
export default function HeaderActions({ uuid }: Props) {
  const { t } = useTranslation('builtInComponents');
  const { busiGroups } = useContext(CommonStateContext);
  const [loadingAction, setLoadingAction] = useState<Action>();

  const runAction = async (action: Action) => {
    if (loadingAction) return;

    setLoadingAction(action);
    try {
      const { content } = await getPayloadByUUID(uuid);
      if (action === 'import') {
        ImportDashboard({
          data: formatBeautifyJson(content),
          busiGroups,
        });
      } else {
        Export({
          data: formatBeautifyJson(content, 'array'),
        });
      }
    } catch {
      // request 已通过全局 notification 提示错误，此处仅兜底避免 unhandled rejection
    } finally {
      setLoadingAction(undefined);
    }
  };

  return (
    <Space size={8}>
      <Tooltip title={t('import_to_buisGroup')}>
        <Button
          aria-label={t('import_to_buisGroup')}
          className='builtin-dashboard-detail-header-action'
          disabled={Boolean(loadingAction)}
          icon={<Import size={16} />}
          loading={loadingAction === 'import'}
          onClick={() => {
            void runAction('import');
          }}
        />
      </Tooltip>
      <Tooltip title={t('common:btn.export')}>
        <Button
          aria-label={t('common:btn.export')}
          className='builtin-dashboard-detail-header-action'
          disabled={Boolean(loadingAction)}
          icon={<ExternalLink size={16} />}
          loading={loadingAction === 'export'}
          onClick={() => {
            void runAction('export');
          }}
        />
      </Tooltip>
    </Space>
  );
}
