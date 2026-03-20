import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import _ from 'lodash';
import { Button } from 'antd';

import { CommonStateContext } from '@/App';
import PageLayout from '@/components/pageLayout';
import BusinessGroup2, { getCleanBusinessGroupIds } from '@/components/BusinessGroup';

import { NS, STATS_COLLAPSED_KEY } from '../../constants';
import { Item, OperateType } from '../../types';
import { PanelLeftCloseIcon, PanelRightCloseIcon } from './panelCloseIcon';
import StatsCards from './StatsCards';
import OperationModal from './OperationModal';
import List from './List';

export default function index() {
  const { t } = useTranslation(NS);
  const { businessGroup } = useContext(CommonStateContext);

  const [gids, setGids] = useState<string | undefined>(businessGroup.ids);
  const [operateType, setOperateType] = useState<OperateType>(OperateType.None);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));

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
    setGids(businessGroup.ids);
  }, [businessGroup.ids]);

  return (
    <PageLayout title={t('title')}>
      <div className='n9e n9e-hosts-ng-list overflow-hidden'>
        <div className='flex gap-[6px] h-full'>
          <BusinessGroup2
            ref={businessGroupRef}
            showSelected={gids !== '0' && gids !== undefined}
            renderHeadExtra={() => {
              return (
                <div className='mb-2'>
                  <div className='text-l1 font-bold leading-none mb-4'>{t('default_filter')}</div>
                  <div
                    className={classNames('justify-between py-[6px] px-[8px] cursor-pointer rounded-md hover:bg-fc-200/80', {
                      'bg-fc-200/90': gids === '0',
                      'font-bold': gids === '0',
                      'text-title': gids === '0',
                    })}
                    onClick={() => {
                      setGids('0');
                    }}
                  >
                    {t('ungrouped_targets')}
                  </div>
                  <div
                    className={classNames('justify-between py-[6px] px-[8px] cursor-pointer rounded-md hover:bg-fc-200/80', {
                      'bg-fc-200/90': gids === undefined,
                      'font-bold': gids === undefined,
                      'text-title': gids === undefined,
                    })}
                    onClick={() => {
                      setGids(undefined);
                    }}
                  >
                    {t('all_targets')}
                  </div>
                </div>
              );
            }}
            onSelect={(key) => {
              const ids = getCleanBusinessGroupIds(key);
              setGids(ids);
            }}
          />
          <div className='w-full min-w-0 flex flex-col'>
            <StatsCards gids={gids} collapsed={statsCollapsed} setCollapsed={setStatsCollapsed} />
            <List
              allCollapseNode={
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
          }}
        />
      )}
    </PageLayout>
  );
}
