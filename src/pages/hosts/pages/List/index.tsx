import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Button, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import { CommonStateContext } from '@/App';
import PageLayout from '@/components/pageLayout';
import BusinessGroup2, { getCleanBusinessGroupIds } from '@/components/BusinessGroup';
import { getTargetsCompatibleGids } from '@/components/BusinessGroup/presetFilters';
import { IS_ENT, IS_PLUS } from '@/utils/constant';

// @ts-ignore — ObsLoop HostEntry（srm-fe parcel；开源/plus 源仓不挂此依赖）
import ObsLoopHostEntry from 'plus:/parcels/ObsLoop/HostEntry';

// @ts-ignore — 主机拓扑（plus parcel；开源构建下解析成空组件）
import { HostTopoViewSwitch, HostTopoGlobalGraph, readHostTopoViewMode } from 'plus:/parcels/Targets';

import { NS, STATS_COLLAPSED_KEY } from '../../constants';
import { Item, OperateType } from '../../types';
import { PanelLeftCloseIcon, PanelRightCloseIcon } from './panelCloseIcon';
import StatsCards from './StatsCards';
import HostFilters, { HostFilterValues } from './HostFilters';
import OperationModal from './OperationModal';
import List from './List';

export default function index() {
  const { t } = useTranslation(NS);
  const { businessGroup } = useContext(CommonStateContext);

  const [gids, setGids] = useState<string | undefined>(() => getTargetsCompatibleGids(businessGroup.ids));
  const [operateType, setOperateType] = useState<OperateType>(OperateType.None);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [refreshFlag, setRefreshFlag] = useState<string>();
  // 筛选条件提到这一层：列表和拓扑是同一批机器的两种看法，切视图时筛选不该丢
  const [hostFilters, setHostFilters] = useState<HostFilterValues>({});

  // 列表 / 拓扑两种视图。开源构建下 readHostTopoViewMode 解析成空，恒为 list
  const [viewMode, setViewMode] = useState<'list' | 'topology'>(() => (IS_PLUS ? readHostTopoViewMode() : 'list'));
  const [statsCollapsed, setStatsCollapsed] = useState(window.localStorage.getItem(STATS_COLLAPSED_KEY) === 'true');
  const [allCollapsed, setAllCollapsed] = useState(false);

  const businessGroupRef = React.useRef<{ getCollapse: () => boolean; setCollapse: (collapse: boolean) => void }>(null);

  // 拓扑图的筛选条件。必须 memo：它进了 GlobalGraph 的 effect 依赖，
  // 写成内联字面量的话每次父组件 render 都是新对象，折叠统计栏这种
  // 跟图毫无关系的状态变化也会触发一次重新取图。
  const selectedIdentsKey = _.join(_.map(selectedRows, 'ident'), ',');
  const hostFilter = React.useMemo(
    () => ({
      idents: selectedIdentsKey ? _.split(selectedIdentsKey, ',') : [],
      query: hostFilters.query,
      hosts: hostFilters.hosts,
      downtime: hostFilters.downtime,
      agent_versions: hostFilters.agent_versions,
    }),
    [selectedIdentsKey, hostFilters.query, hostFilters.hosts, hostFilters.downtime, hostFilters.agent_versions],
  );

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

  // 折叠与刷新两个视图都要：折叠是给主区域腾地方——图比表格更吃空间，
  // 拓扑视图下反而更需要；刷新对一张实时的图更是必需（服务端还有 30 秒缓存，
  // 所以刷新会带一个随机串把那层缓存也绕过去，见 hostTopoGraph 的缓存键）。
  const allCollapseNode = (
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
  );

  return (
    <PageLayout
      title={t('title')}
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/infrastructure/server-list/'
      headerCenter={IS_ENT ? <ObsLoopHostEntry gids={gids} /> : undefined}
    >
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
            {IS_PLUS && (
              <div className='mb-2'>
                <HostTopoViewSwitch value={viewMode} onChange={setViewMode} />
              </div>
            )}
            {viewMode === 'topology' && IS_PLUS ? (
              <div className='flex-1 min-h-0 flex flex-col gap-2'>
                {/* 拓扑视图下 <List/> 整个不渲染，它那条工具栏也跟着没了。
                    这里挂同一个 HostFilters、共用同一份状态，切视图筛选不丢。
                    批量操作不搬过来：那是选中表格行之后的动作，图上没有对应语义。 */}
                <div className='fc-border rounded-lg p-2 flex flex-wrap items-center gap-2'>
                  {allCollapseNode}
                  <Button icon={<ReloadOutlined />} onClick={() => setRefreshFlag(_.uniqueId('refreshFlag_'))} />
                  <HostFilters value={hostFilters} onChange={setHostFilters} />
                </div>
                <div className='flex-1 min-h-0'>
                  <HostTopoGlobalGraph gids={gids} hostFilter={hostFilter} refreshFlag={refreshFlag} />
                </div>
              </div>
            ) : (
            <List
              allCollapseNode={allCollapseNode}
              gids={gids}
              filters={hostFilters}
              setFilters={setHostFilters}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              refreshFlag={refreshFlag}
              setRefreshFlag={setRefreshFlag}
              setOperateType={setOperateType}
            />
            )}
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
