import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Button, Tooltip } from 'antd';

import { CommonStateContext } from '@/App';
import PageLayout from '@/components/pageLayout';
import BusinessGroup2, { getCleanBusinessGroupIds } from '@/components/BusinessGroup';
import { getTargetsCompatibleGids } from '@/components/BusinessGroup/presetFilters';

import { NS, STATS_COLLAPSED_KEY } from '../../constants';
import { Item, OperateType } from '../../types';
import { PanelLeftCloseIcon, PanelRightCloseIcon } from './panelCloseIcon';
import StatsCards from './StatsCards';
import OperationModal from './OperationModal';
import List from './List';

export default function index() {
  const { t } = useTranslation(NS);
  const { businessGroup } = useContext(CommonStateContext);

  const [gids, setGids] = useState<string | undefined>(() => getTargetsCompatibleGids(businessGroup.ids));
  const [operateType, setOperateType] = useState<OperateType>(OperateType.None);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [refreshFlag, setRefreshFlag] = useState<string>();

  const [statsCollapsed, setStatsCollapsed] = useState(window.localStorage.getItem(STATS_COLLAPSED_KEY) === 'true');
  const [allCollapsed, setAllCollapsed] = useState(false);

  const businessGroupRef = React.useRef<{ getCollapse: () => boolean; setCollapse: (collapse: boolean) => void }>(null);

  useEffect(() => {
    // 如果 businessGroup 和 stats 都是折叠的则 allCollapsed 也设置成折叠
    if (businessGroupRef.current?.getCollapse() && statsCollapsed) {
      setAllCollapsed(true);
    } else {
      setAllCollapsed(false);
    }
  }, []);

  useEffect(() => {
    setGids(getTargetsCompatibleGids(businessGroup.ids));
  }, [businessGroup.ids]);

  return (
    <PageLayout title={t('title')} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/infrastructure/server-list/'>
      <div className='n9e n9e-hosts-ng-list overflow-hidden'>
        <div className='flex gap-[6px] h-full'>
          <BusinessGroup2
            ref={businessGroupRef}
            // 「公开仪表盘」仅仪表盘页支持；切到机器列表时已将其转换为「全部机器」，
            // 同步左侧组件的选中值，避免它依据全局的 group,-1 将 URL 回写为 ids=-1。
            selected={businessGroup.ids === '-1' ? 'group,-2' : undefined}
            presetFilterTitle={t('default_filter')}
            presetFilters={[
              { value: '0', label: t('ungrouped_targets') },
              { value: '-2', label: t('all_targets') },
            ]}
            onSelect={(key) => {
              const ids = getCleanBusinessGroupIds(key);
              setGids(ids);
            }}
          />
          <div className='w-full min-w-0 flex flex-col'>
            <StatsCards gids={gids} collapsed={statsCollapsed} setCollapsed={setStatsCollapsed} refreshFlag={refreshFlag} />
            <List
              allCollapseNode={
                <Tooltip title={allCollapsed ? t('expand_busi_and_overview') : t('collapse_busi_and_overview')}>
                  <Button
                    icon={allCollapsed ? <PanelRightCloseIcon /> : <PanelLeftCloseIcon />}
                    onClick={() => {
                      const newCollapsed = !allCollapsed;
                      setAllCollapsed(newCollapsed);
                      businessGroupRef.current?.setCollapse(newCollapsed);
                      setStatsCollapsed(newCollapsed);
                      window.localStorage.setItem(STATS_COLLAPSED_KEY, newCollapsed.toString());
                    }}
                  />
                </Tooltip>
              }
              gids={gids}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              refreshFlag={refreshFlag}
              setRefreshFlag={setRefreshFlag}
              setOperateType={setOperateType}
            />
          </div>
        </div>
      </div>
      {_.includes(_.values(OperateType), operateType) && (
        <OperationModal
          operateType={operateType}
          setOperateType={setOperateType}
          idents={_.map(selectedRows, 'ident')}
          reloadList={() => {
            setRefreshFlag(_.uniqueId('refreshFlag_'));
            setSelectedRows([]);
          }}
        />
      )}
    </PageLayout>
  );
}
