import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { SettingOutlined } from '@ant-design/icons';
import BusinessGroupSideBarWithAll, { getDefaultGids } from '@/components/BusinessGroup/BusinessGroupSideBarWithAll';
import { CommonStateContext } from '@/App';
import PageTable from './PageTable';
import Edit from './edit';
import Add from './add';
import './locale';
import './index.less';

export { Edit, Add };
const N9E_GIDS_LOCALKEY = 'n9e_recording_rules_gids';

const Strategy: React.FC = () => {
  const { businessGroup } = useContext(CommonStateContext);
  const { t } = useTranslation('recordingRules');
  const [gids, setGids] = useState<string | undefined>(getDefaultGids(N9E_GIDS_LOCALKEY, businessGroup));
  const [groupSwitchCount, setGroupSwitchCount] = useState(0);
  // 切换业务组时通知列表重置到第一页（在业务组选择源头触发，不依赖 gids 变化时序）
  const handleSelectGids = (ids: string) => {
    setGids(ids);
    setGroupSwitchCount((count) => count + 1);
  };

  return (
    <PageLayout title={t('title')} icon={<SettingOutlined />} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/data-query/metrics/recording-rules/'>
      <div className='strategy-content'>
        <BusinessGroupSideBarWithAll gids={gids} setGids={handleSelectGids} localeKey={N9E_GIDS_LOCALKEY} />
        <PageTable gids={gids} groupSwitchCount={groupSwitchCount} />
      </div>
    </PageLayout>
  );
};

export default Strategy;
