import React, { useState, useEffect, useContext } from 'react';
import { Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import PageLayout from '@/components/pageLayout';
import { getBusiGroupsAlertSubscribes } from '@/services/subscribe';
import { subscribeItem } from '@/store/warningInterface/subscribe';
import BusinessGroupSideBarWithAll, { getDefaultGids } from '@/components/BusinessGroup/BusinessGroupSideBarWithAll';
import { CommonStateContext } from '@/App';

import './locale';
import './index.less';

export { default as Add } from './add';
export { default as Edit } from './edit';
import ListNG from './ListNG';

const N9E_GIDS_LOCALKEY = 'n9e_subscribes_gids';

export default function List() {
  const { t } = useTranslation('alertSubscribes');
  const history = useHistory();
  const { businessGroup } = useContext(CommonStateContext);
  const [gids, setGids] = useState<string | undefined>(getDefaultGids(N9E_GIDS_LOCALKEY, businessGroup)); // -2: 所有告警策略
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [data, setData] = useState<Array<subscribeItem>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const getList = async () => {
    if (gids) {
      setLoading(true);
      const ids = gids === '-2' ? undefined : gids;
      const { success, dat } = await getBusiGroupsAlertSubscribes(ids);
      if (success) {
        setData(dat || []);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getList();
  }, [gids, refreshFlag]);

  return (
    <PageLayout title={t('title')} icon={<CopyOutlined />}>
      <div className='shield-content'>
        <BusinessGroupSideBarWithAll gids={gids} setGids={setGids} localeKey={N9E_GIDS_LOCALKEY} />
        <div
          className='n9e-border-base p2'
          style={{
            width: '100%',
            overflow: 'hidden auto',
          }}
        >
          <ListNG
            hideBusinessGroupColumn={businessGroup.isLeaf && gids !== '-2'}
            headerExtra={
              businessGroup.isLeaf && gids !== '-2' ? (
                <div>
                  <Button
                    type='primary'
                    className='add'
                    onClick={() => {
                      history.push('/alert-subscribes/add');
                    }}
                  >
                    {t('common:btn.add')}
                  </Button>
                </div>
              ) : null
            }
            data={data}
            loading={loading}
            setRefreshFlag={setRefreshFlag}
          />
        </div>
      </div>
    </PageLayout>
  );
}
