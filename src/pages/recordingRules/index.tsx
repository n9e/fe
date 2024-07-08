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

export { Edit, Add };
const N9E_GIDS_LOCALKEY = 'n9e_recording_rules_gids';

const Strategy: React.FC = () => {
  const { businessGroup } = useContext(CommonStateContext);
  const { t } = useTranslation('recordingRules');
  const [gids, setGids] = useState<string | undefined>(getDefaultGids(N9E_GIDS_LOCALKEY, businessGroup));

  return (
    <PageLayout title={t('title')} icon={<SettingOutlined />}>
      <div className='strategy-content'>
        <BusinessGroupSideBarWithAll gids={gids} setGids={setGids} localeKey={N9E_GIDS_LOCALKEY} />
        <PageTable gids={gids} />
      </div>
    </PageLayout>
  );
};

export default Strategy;
