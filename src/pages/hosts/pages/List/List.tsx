import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Space, Select, Dropdown, Menu, Table, Divider, Tooltip, Modal, message } from 'antd';
import { ReloadOutlined, SearchOutlined, DownOutlined, QuestionCircleOutlined, CopyOutlined, ApartmentOutlined, DownloadOutlined } from '@ant-design/icons';
import _ from 'lodash';
import semver from 'semver';
import { useAntdTable } from 'ahooks';
import classNames from 'classnames';
import moment from 'moment';

import { CommonStateContext } from '@/App';
import N9EProgress from '@/components/N9EProgress';
import { IS_PLUS } from '@/utils/constant';
import { copy2ClipBoard } from '@/utils';
import getTextWidth from '@/utils/getTextWidth';
import usePagination from '@/components/usePagination';
import DocumentDrawer from '@/components/DocumentDrawer';
import EmptyGuide from '@/components/EmptyGuide';
import HostsSelect from '@/pages/targets/components/HostsSelect';
import Explorer from '@/pages/targets/components/Explorer';
import EditBusinessGroups from '@/pages/targets/components/EditBusinessGroups';
import TargetMetaDrawer from '@/pages/targets/TargetMetaDrawer';
import { timeFormatter } from '@/pages/dashboard/Renderer/utils/valueFormatter';

// @ts-ignore
import CollectsDrawer from 'plus:/pages/collects/CollectsDrawer';
// @ts-ignore
import UpgradeAgent from 'plus:/parcels/Targets/UpgradeAgent';
// @ts-ignore
import VersionSelect from 'plus:/parcels/Targets/VersionSelect';

import { NS } from '../../constants';
import { Item, OperateType } from '../../types';
import { getList, getCategrafInstallMeta, CategrafInstallMeta } from '../../services';
import InstallCategraf from './InstallCategraf';
import { normalizeServerAddr } from './InstallCategraf/buildCommand';
import getAuthLevelDisplayMap from '../../utils/getAuthLevelDisplayMap';
import VersionIcon from './VersionIcon';
import Tags from './Tags';
import { formatBeatTimeDisplay } from './formatBeatTimeDisplay';
import AuthLevelDropdown from './AuthLevelDropdown';

const downtimeOptions = [1, 2, 3, 5, 10, 30];
/** 老后端拿不到 installMeta 时文档里手动安装的兜底版本，随 categraf release 更新（2026-07 时为最新版） */
const FALLBACK_CATEGRAF_VERSION = 'v0.5.15';
const AI_TASK_AGENT_MIN_VERSION = '0.5.27';
const AI_TASK_WINDOWS_AGENT_MIN_VERSION = '0.5.30';

/** Fixed IP cell width sample: "IP " + longest dotted IPv4 */
const IDENT_IP_V4_MAX_SAMPLE = 'IP 255.255.255.255';
/** Fixed IP cell width sample: "IP " + long textual IPv6 */
const IDENT_IP_V6_MAX_SAMPLE = 'IP ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff';
/** Suffix for meta width: long OS + arch placeholder (cores count + t('cores') prepended in render) */
const IDENT_META_MAX_SAMPLE_SUFFIX = 'windows aarch64';

function isHostIpLikelyIpv6(hostIp: string): boolean {
  return hostIp.trim().includes(':');
}

function getAiTaskAgentMinVersion(os?: string): string {
  return os?.toLowerCase() === 'windows' ? AI_TASK_WINDOWS_AGENT_MIN_VERSION : AI_TASK_AGENT_MIN_VERSION;
}

function Unknown({ record }: { record: Item }) {
  const { t } = useTranslation(NS);
  return (
    <Tooltip title={t('unknown_tip')}>
      <span
        className={classNames({
          'text-soft': record.target_up === 0,
          'text-title': record.target_up !== 0,
        })}
      >
        Unknown
      </span>
    </Tooltip>
  );
}

function getStrokeColor(val: number) {
  if (val < 60) {
    return 'var(--fc-fill-success)';
  }
  if (val < 80) {
    return 'var(--fc-fill-alert)';
  }
  return 'var(--fc-fill-error)';
}

function getTrailColor(val: number) {
  if (val < 60) {
    return 'var(--fc-green-3)';
  }
  if (val < 80) {
    return 'var(--fc-orange-3)';
  }
  return 'var(--fc-red-3)';
}

interface Props {
  allCollapseNode?: React.ReactNode;
  editable?: boolean;
  explorable?: boolean;
  gids?: string;
  selectedRows: Item[];
  setSelectedRows: (selectedRowKeys: Item[]) => void;
  refreshFlag?: string;
  setRefreshFlag: (refreshFlag: string) => void;
  setOperateType?: (operateType: OperateType) => void;
  /*
   * ai-task 页面里的通道管理
   * 删除 机器标识或是 IP 筛选项
   * 添加 通道等级 筛选项
   * 删除 更新时间、各指标数据等列
   * 添加 通道等级 列
   * 调整 业务组 列位置到第一列
   */
  aiTaskMode?: boolean;
}

export default function List(props: Props) {
  const { t, i18n } = useTranslation(NS);
  const { t: tTargets } = useTranslation('targets');
  const { darkMode, siteInfo } = useContext(CommonStateContext);
  const pagination = usePagination({ PAGESIZE_KEY: 'hosts-ng' });

  const { allCollapseNode, editable = true, explorable = true, gids, selectedRows, setSelectedRows, refreshFlag, setRefreshFlag, setOperateType, aiTaskMode = false } = props;
  const selectedIdents = _.map(selectedRows, 'ident');

  const [collectsDrawerVisible, setCollectsDrawerVisible] = useState(false);
  const [collectsDrawerIdent, setCollectsDrawerIdent] = useState('');
  const [metaDrawerOpen, setMetaDrawerOpen] = useState(false);
  const [metaDrawerIdent, setMetaDrawerIdent] = useState('');
  const [upgradeTargetIdent, setUpgradeTargetIdent] = useState<string | null>(null);
  // null 表示后端不支持一键安装（老版本 / 企业版），此时不展示入口，避免死按钮
  const [installMeta, setInstallMeta] = useState<CategrafInstallMeta | null>(null);
  const [installVisible, setInstallVisible] = useState(false);

  const [searchValue, setSearchValue] = useState('');
  const [params, setParams] = useState<{
    limit: number;
    p: number;
    gids?: string;
    query?: string;
    hosts?: string;
    downtime?: number;
    agent_versions?: string[];
    auth_level?: string; // 逗号分隔，如 '1,2,3'
  }>({
    limit: pagination.pageSize,
    p: 1,
  });

  const featchData = ({ current, pageSize }: { current: number; pageSize: number }): Promise<any> => {
    return getList({
      gids: gids === '-2' ? undefined : gids,
      limit: pageSize,
      p: current,
      query: params.query,
      downtime: params.downtime,
      agent_versions: _.isEmpty(params.agent_versions) ? undefined : JSON.stringify(params.agent_versions),
      hosts: params.hosts,
      auth_level: params.auth_level,
    }).then((res) => {
      return {
        total: res.total,
        list: res.list,
      };
    });
  };

  const { tableProps, run } = useAntdTable(featchData, {
    manual: true,
    defaultPageSize: localStorage.getItem('targetsListPageSize') ? _.toNumber(localStorage.getItem('targetsListPageSize')) : 30,
  });

  useEffect(() => {
    setSelectedRows([]);
    run({
      current: 1,
      pageSize: tableProps.pagination.pageSize,
    });
  }, [gids, params.query, params.downtime, params.agent_versions, params.hosts, params.auth_level]);

  useEffect(() => {
    if (refreshFlag) {
      run({
        current: tableProps.pagination.current,
        pageSize: tableProps.pagination.pageSize,
      });
    }
  }, [refreshFlag]);

  useEffect(() => {
    if (aiTaskMode) return;
    getCategrafInstallMeta().then(setInstallMeta);
  }, []);

  const openCategrafDoc = () => {
    DocumentDrawer({
      language: i18n.language,
      darkMode,
      title: t('categraf_doc'),
      documentPath: '/n9e-docs/categraf',
      variables: {
        // site_url 是站点设置里的自由文本，可能缺协议或带尾斜杠，统一 normalize 后再进文档
        server_addr: normalizeServerAddr(installMeta?.base_url || siteInfo?.site_url) || window.location.origin,
        categraf_version: installMeta?.version || FALLBACK_CATEGRAF_VERSION,
      },
    });
  };

  // 有搜索/筛选时的空结果不代表「该业务组没有机器」，此时不展示部署引导，避免误导用户去重复部署采集器
  const hasActiveFilter = !!(params.query || params.hosts || !_.isNil(params.downtime) || !_.isEmpty(params.agent_versions) || params.auth_level);

  const groupObjsColumn: {
    dataIndex: string;
    title: React.ReactNode;
    render: (val: any, record: any) => React.ReactNode;
  } = {
    dataIndex: 'group_objs',
    title: t('group_objs'),
    render: (val, record) => {
      const minWidth = getTextWidth(t('group_objs')) + 4;
      const groupNames = _.map(val, 'name');
      if (_.isEmpty(groupNames)) {
        return <div style={{ minWidth }}>-</div>;
      }
      return (
        <div className='w-[200px]' style={{ minWidth }}>
          <Tags type='fill' data={groupNames} fontColor={record.target_up === 0 ? 'text-soft' : undefined} />
        </div>
      );
    },
  };

  return (
    <>
      <div
        className={classNames('flex-shrink-0 flex justify-between', {
          'bg-fc-100 fc-border rounded-lg p-4': !aiTaskMode,
        })}
      >
        <Space>
          {allCollapseNode}
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setRefreshFlag(_.uniqueId('refreshFlag_'));
            }}
          />
          {!aiTaskMode && installMeta && (
            <Button type='primary' ghost icon={<DownloadOutlined />} onClick={() => setInstallVisible(true)}>
              {t('install.entry')}
            </Button>
          )}
          <Input
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            placeholder={t('search_placeholder')}
            allowClear
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={() => {
              setParams((p) => ({ ...p, query: searchValue }));
            }}
            onBlur={() => {
              setParams((p) => ({ ...p, query: searchValue }));
            }}
          />
          {!aiTaskMode && (
            <HostsSelect
              value={params.hosts}
              onChange={(newHosts) => {
                setParams((p) => ({ ...p, hosts: newHosts }));
              }}
            />
          )}
          <Select
            allowClear
            placeholder={t('filterDowntime')}
            style={{ minWidth: 120 }}
            dropdownMatchSelectWidth={false}
            options={[
              {
                label: t('filterDowntimeNegative'),
                options: _.map(downtimeOptions, (item) => {
                  return {
                    label: t('filterDowntimeNegativeMin', { count: item }),
                    value: -(item * 60),
                  };
                }),
              },
              {
                label: t('filterDowntimePositive'),
                options: _.map(downtimeOptions, (item) => {
                  return {
                    label: t('filterDowntimePositiveMin', { count: item }),
                    value: item * 60,
                  };
                }),
              },
            ]}
            value={params.downtime}
            onChange={(val) => {
              setParams((p) => ({ ...p, downtime: val }));
            }}
          />
          <VersionSelect
            value={params.agent_versions}
            onChange={(val) => {
              setParams((p) => ({ ...p, agent_versions: val }));
            }}
          />
          {aiTaskMode && (
            <Select
              style={{ minWidth: 120 }}
              allowClear
              showArrow
              mode='multiple'
              placeholder={t('auth_level')}
              dropdownMatchSelectWidth={false}
              options={[
                { label: t('auth_level_1'), value: 1 },
                { label: t('auth_level_2'), value: 2 },
                { label: t('auth_level_3'), value: 3 },
              ]}
              value={params.auth_level ? params.auth_level.split(',').map(Number) : undefined}
              onChange={(val: number[]) => {
                setParams((p) => ({ ...p, auth_level: val.length > 0 ? val.join(',') : undefined }));
              }}
            />
          )}
        </Space>
        <Space>
          {editable && aiTaskMode === false && (
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu
                  onClick={({ key }) => {
                    if (key && setOperateType) {
                      setOperateType(key as OperateType);
                    }
                  }}
                >
                  <Menu.Item key={OperateType.BindTag}>{t('bind_tag.title')}</Menu.Item>
                  <Menu.Item key={OperateType.UnbindTag}>{t('unbind_tag.title')}</Menu.Item>
                  <Menu.Item key='EditBusinessGroups'>
                    <EditBusinessGroups
                      gids={gids}
                      idents={selectedIdents}
                      selectedRows={selectedRows}
                      onOk={() => {
                        setRefreshFlag(_.uniqueId('refreshFlag_'));
                        setSelectedRows([]);
                      }}
                    />
                  </Menu.Item>
                  <Menu.Item key={OperateType.UpdateNote}>{t('update_note.title')}</Menu.Item>
                  <Menu.Item key={OperateType.Delete}>{t('batch_delete.title')}</Menu.Item>
                  <Menu.Item key='UpgradeAgent'>
                    <UpgradeAgent
                      selectedIdents={selectedIdents}
                      onOk={() => {
                        setRefreshFlag(_.uniqueId('refreshFlag_'));
                      }}
                    />
                  </Menu.Item>
                </Menu>
              }
            >
              <Button>
                {t('common:btn.batch_operations')} <DownOutlined />
              </Button>
            </Dropdown>
          )}
          {IS_PLUS && aiTaskMode === true && (
            <AuthLevelDropdown
              selectedIdents={selectedIdents}
              selectedRows={selectedRows}
              onSuccess={() => {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
                setSelectedRows([]);
              }}
            />
          )}
          {explorable && (
            <Tooltip title={t('explorer_selected_metrics_tip')}>
              <span>
                <Explorer selectedIdents={selectedIdents} />
              </span>
            </Tooltip>
          )}
        </Space>
      </div>
      <div className={classNames('n9e-hosts-ng-table mt-4', { 'n9e-antd-table-height-full': !aiTaskMode })}>
        <Table
          {...tableProps}
          rowKey='id'
          size='small'
          tableLayout='auto'
          scroll={{ x: tableProps.dataSource.length > 0 ? 'max-content' : undefined, y: 'calc(100% - 38px)' }}
          onRow={(record) => ({
            className: 'group cursor-pointer',
            onClick: (e) => {
              const el = e.target as HTMLElement;
              if (
                el.closest(
                  'button, a[href], input, textarea, select, label.ant-checkbox-wrapper, .ant-checkbox-wrapper, .ant-dropdown, .ant-select, .ant-picker, .ant-table-selection-column',
                )
              ) {
                return;
              }
              setMetaDrawerIdent(record.ident);
              setMetaDrawerOpen(true);
            },
          })}
          locale={{
            emptyText:
              !IS_PLUS && !hasActiveFilter ? (
                <EmptyGuide
                  title={t('empty_guide.title')}
                  description={t('empty_guide.desc')}
                  actions={
                    <>
                      <Button type='primary' onClick={() => (installMeta ? setInstallVisible(true) : openCategrafDoc())}>
                        {installMeta ? t('install.entry') : t('empty_guide.deploy_btn')}
                      </Button>
                      <a onClick={openCategrafDoc}>{t('categraf_doc')}</a>
                    </>
                  }
                />
              ) : undefined,
          }}
          rowSelection={{
            type: 'checkbox',
            preserveSelectedRowKeys: true,
            selectedRowKeys: _.map(selectedRows, 'id'),
            onChange(_selectedRowKeys, selectedRows: Item[]) {
              setSelectedRows(selectedRows);
            },
          }}
          pagination={{
            ...tableProps.pagination,
            ...pagination,
            onChange(page, pageSize) {
              localStorage.setItem('targetsListPageSize', _.toString(pageSize));
            },
          }}
          columns={
            _.concat(
              aiTaskMode ? [groupObjsColumn] : [],
              [
                {
                  dataIndex: 'ident',
                  title: (
                    <Space>
                      {t('ident')}
                      <Dropdown
                        trigger={['click']}
                        overlay={
                          <Menu
                            onClick={async ({ key }) => {
                              let tobeCopy = _.map(tableProps.dataSource, (item) => item.ident);
                              if (key === 'all') {
                                try {
                                  const result = await featchData({ current: 1, pageSize: tableProps.pagination.total });
                                  tobeCopy = _.map(result.list, (item) => item.ident);
                                } catch (error) {
                                  console.error(error);
                                }
                              } else if (key === 'selected') {
                                tobeCopy = selectedIdents;
                              }

                              if (_.isEmpty(tobeCopy)) {
                                message.warn(t('copy.no_data'));
                                return;
                              }

                              const tobeCopyStr = _.join(tobeCopy, '\n');
                              const copySucceeded = copy2ClipBoard(tobeCopyStr);

                              if (copySucceeded) {
                                message.success(t('ident_copy_success', { num: tobeCopy.length }));
                              } else {
                                Modal.warning({
                                  title: t('common:copyToClipboardFailed'),
                                  content: <Input.TextArea defaultValue={tobeCopyStr} />,
                                });
                              }
                            }}
                          >
                            <Menu.Item key='current_page'>{t('copy.current_page')}</Menu.Item>
                            <Menu.Item key='all'>{t('copy.all')}</Menu.Item>
                            <Menu.Item key='selected'>{t('copy.selected')}</Menu.Item>
                          </Menu>
                        }
                      >
                        <CopyOutlined className='cursor-pointer' />
                      </Dropdown>
                    </Space>
                  ),
                  render: (ident, record) => {
                    const ipWidthSample = record.host_ip && isHostIpLikelyIpv6(record.host_ip) ? IDENT_IP_V6_MAX_SAMPLE : IDENT_IP_V4_MAX_SAMPLE;
                    const identIpWidth = getTextWidth(ipWidthSample);
                    const identMetaWidth = getTextWidth(`256 ${t('cores')} ${IDENT_META_MAX_SAMPLE_SUFFIX}`) + 20; // 14 的 icon + 间距 + 容错
                    const ipDisplay = record.host_ip ? `IP ${record.host_ip}` : '-';
                    const coresDisplay = record.cpu_num === -1 ? '-' : `${record.cpu_num} ${t('cores')}`;
                    const archDisplay = record.arch === '' ? '-' : record.arch;

                    return (
                      <div>
                        <div className='flex items-center'>
                          <Tooltip title={tTargets('meta_tip')} placement='left'>
                            <span
                              className={classNames('mb-[2px]', {
                                'text-soft': record.target_up === 0,
                                'text-title': record.target_up !== 0,
                              })}
                            >
                              {ident}
                            </span>
                          </Tooltip>
                          {IS_PLUS && (
                            <Tooltip title={t('view_collects')}>
                              <Button
                                className='ml-2 invisible group-hover:visible'
                                size='small'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCollectsDrawerVisible(true);
                                  setCollectsDrawerIdent(ident);
                                }}
                                icon={<ApartmentOutlined />}
                              />
                            </Tooltip>
                          )}
                        </div>
                        <Space size={4} className='flex flex-wrap items-center'>
                          {record.host_ip ? (
                            <span className='inline-block min-w-0 truncate align-bottom text-soft' style={{ width: identIpWidth }}>
                              {ipDisplay}
                            </span>
                          ) : (
                            <span className='inline-block min-w-0 truncate align-bottom text-soft' style={{ width: identIpWidth }}>
                              {ipDisplay}
                            </span>
                          )}
                          <Divider type='vertical' />
                          <div className='min-w-0 flex shrink items-center gap-1 text-soft' style={{ width: identMetaWidth }}>
                            {record.os === '' ? (
                              <span className='shrink-0'>-</span>
                            ) : (
                              <>
                                <img className='shrink-0 flex' src={`/image/sys_${record.os}.svg`} alt='' />
                                <span className='min-w-0 shrink truncate'>{record.os}</span>
                              </>
                            )}
                            <span className='min-w-0 shrink truncate'>{coresDisplay}</span>
                            <span className='min-w-0 shrink truncate'>{archDisplay}</span>
                          </div>
                        </Space>
                      </div>
                    );
                  },
                },
                {
                  dataIndex: 'target_up',
                  title: t('status'),
                  render: (_val, record) => {
                    const isOnline = record.target_up !== 0;
                    const label = isOnline ? t('online') : t('offline');
                    const minWidth = getTextWidth(label) + 28; // 6 圆点 + 4 间距 + 16 内边距 + 容错
                    return (
                      <div style={{ minWidth }}>
                        <span
                          className={classNames('inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded-[4px] px-2 leading-none', {
                            'bg-success/10 text-success': isOnline,
                            'bg-fc-200 text-soft': !isOnline,
                          })}
                        >
                          <span
                            className={classNames('h-2 w-2 shrink-0 rounded-full', {
                              'bg-success': isOnline,
                              'bg-fc-400': !isOnline,
                            })}
                          />
                          <span className='leading-none'>{label}</span>
                        </span>
                      </div>
                    );
                  },
                },
              ],
              aiTaskMode && IS_PLUS
                ? [
                    {
                      dataIndex: 'ai_task_auth_level',
                      title: t('auth_level'),
                      render: (val) => {
                        const minWidth = getTextWidth(t('auth_level')) + 4;
                        if (val === null || val === undefined) {
                          return <div style={{ minWidth }}>-</div>;
                        }
                        const authLevelDisplayMap = getAuthLevelDisplayMap(t);
                        return (
                          <div style={{ minWidth }}>
                            <Tags type='fill' data={[authLevelDisplayMap[val]?.text]} bgColor={authLevelDisplayMap[val]?.bgColor} fontColor={authLevelDisplayMap[val]?.fontColor} />
                          </div>
                        );
                      },
                    },
                  ]
                : [],
              [
                {
                  dataIndex: 'agent_version',
                  title: t('agent_version_title'),
                  render: (val, record) => {
                    const display = record.agent_version || 'Null';
                    const hasUpgrade = record.new_version && record.agent_version !== record.new_version;
                    const displayText = hasUpgrade ? `${display} / ${record.new_version}` : display;
                    const minWidth = Math.max(getTextWidth(t('agent_version_title')), getTextWidth(displayText) + 36) + 8;
                    const aiTaskAgentMinVersion = getAiTaskAgentMinVersion(record.os);

                    // aiTaskMode 下检测 Agent 版本是否需要 ent 升级提示
                    const needsEntUpgrade =
                      aiTaskMode &&
                      IS_PLUS &&
                      record.agent_version &&
                      (!record.agent_version.startsWith('ent') ||
                        (() => {
                          const ver = record.agent_version.replace('ent-', '');
                          return !semver.valid(ver) || semver.lt(ver, aiTaskAgentMinVersion);
                        })());

                    const badge = (
                      <div
                        className={classNames('inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded-[4px] px-2 leading-none', {
                          'bg-fc-200': record.agent_version !== '' && record.agent_version !== null,
                          'bg-alert/10': record.agent_version === '' || record.agent_version === null,
                          'text-alert': record.agent_version === '' || record.agent_version === null,
                          'text-soft': record.target_up === 0,
                          'text-title': record.target_up !== 0,
                        })}
                      >
                        <VersionIcon className='flex leading-none' style={needsEntUpgrade ? { color: 'var(--fc-fill-alert)' } : { color: 'var(--fc-fill-success)' }} />
                        <span className='leading-none'>{displayText}</span>
                      </div>
                    );

                    const showTooltip = hasUpgrade || needsEntUpgrade;

                    return (
                      <div style={{ minWidth }}>
                        {showTooltip ? (
                          <Tooltip
                            overlayClassName='ant-tooltip-with-link'
                            title={
                              <div>
                                {hasUpgrade && (
                                  <div className='mb-1'>
                                    {t('current_version')}: {display}
                                    <br />
                                    {t('upgrade_version')}: {record.new_version}
                                  </div>
                                )}
                                {needsEntUpgrade && (
                                  <div>
                                    {t('upgrade_not_support_tip', { version: `ent-v${aiTaskAgentMinVersion}` })}{' '}
                                    <a
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUpgradeTargetIdent(record.ident);
                                      }}
                                    >
                                      {t('go_upgrade')}
                                    </a>
                                  </div>
                                )}
                              </div>
                            }
                          >
                            {badge}
                          </Tooltip>
                        ) : (
                          badge
                        )}
                      </div>
                    );
                  },
                },
                {
                  dataIndex: 'host_tags',
                  title: (
                    <Space>
                      {t('common:host.host_tags')}
                      <Tooltip title={t('common:host.host_tags_tip')}>
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  ),
                  render: (tags: string[], record: Item) => {
                    const minWidth = getTextWidth(t('common:host.host_tags')) + 24; // 12 的icon宽度 + 8 的间距 + 4 的容错
                    if (_.isEmpty(tags)) {
                      return <div style={{ minWidth }}>-</div>;
                    }
                    return (
                      <div className='w-[200px]' style={{ minWidth }}>
                        <Tags
                          type='outline'
                          data={tags}
                          fontColor={record.target_up === 0 ? 'text-soft' : 'text-title'}
                          onTagClick={(tag) => {
                            if (!_.includes(params.query, tag)) {
                              const val = params.query ? `${params.query.trim()} ${tag}` : tag;
                              setParams((p) => ({ ...p, query: val }));
                              setSearchValue(val);
                            }
                          }}
                        />
                      </div>
                    );
                  },
                },
                {
                  dataIndex: 'tags',
                  title: (
                    <Space>
                      {t('common:host.tags')}
                      <Tooltip title={t('common:host.tags_tip')}>
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  ),
                  render: (tags: string[], record: Item) => {
                    const minWidth = getTextWidth(t('common:host.tags')) + 24;
                    if (_.isEmpty(tags)) {
                      return <div style={{ minWidth }}>-</div>;
                    }
                    return (
                      <div className='w-[200px]' style={{ minWidth }}>
                        <Tags
                          type='outline'
                          data={tags}
                          fontColor={record.target_up === 0 ? 'text-soft' : 'text-title'}
                          onTagClick={(tag) => {
                            if (!_.includes(params.query, tag)) {
                              const val = params.query ? `${params.query.trim()} ${tag}` : tag;
                              setParams((p) => ({ ...p, query: val }));
                              setSearchValue(val);
                            }
                          }}
                        />
                      </div>
                    );
                  },
                },
              ],
              aiTaskMode
                ? []
                : [
                    groupObjsColumn,
                    {
                      dataIndex: 'beat_time',
                      title: t('beat_time'),
                      render: (val, record) => {
                        const minWidth = Math.max(
                          getTextWidth(t('beat_time')) + 24,
                          getTextWidth(t('beat_time_just_now')),
                          getTextWidth(t('beat_time_mins_ago', { count: 59 })),
                          getTextWidth(t('beat_time_hours_ago', { count: 23 })),
                        );
                        if (record.cpu_num === -1 || !_.isNumber(val)) {
                          return (
                            <div style={{ minWidth }}>
                              <Unknown record={record} />
                            </div>
                          );
                        }
                        let backgroundColor = 'var(--fc-fill-success)';
                        if (record.target_up === 0) {
                          backgroundColor = 'rgb(var(--fc-fill-5-rgb) / 0.6)';
                        }
                        const nowMs = Date.now();
                        const display = formatBeatTimeDisplay(val, nowMs, t);
                        const absoluteTitle = moment.unix(val).format('YYYY-MM-DD HH:mm:ss');
                        const textBlock = (
                          <div
                            className={classNames({
                              'text-soft': record.target_up === 0,
                              'text-title': record.target_up !== 0,
                            })}
                          >
                            {display.kind === 'relative' ? (
                              <div>{display.relativeLabel}</div>
                            ) : (
                              <>
                                <div>{display.absoluteDate}</div>
                                <div>{display.absoluteTime}</div>
                              </>
                            )}
                          </div>
                        );
                        return (
                          <div style={{ minWidth }}>
                            <Space size={8} align='center'>
                              <div className='w-[4px] h-[16px] rounded' style={{ backgroundColor }} />
                              {display.kind === 'relative' ? <Tooltip title={absoluteTitle}>{textBlock}</Tooltip> : textBlock}
                            </Space>
                          </div>
                        );
                      },
                    },
                    {
                      dataIndex: 'mem_util',
                      title: t('mem_util'),
                      render: (val: number, record) => {
                        const minWidth = getTextWidth(t('mem_util')) + 4;
                        if (record.cpu_num === -1 || !_.isNumber(val)) {
                          return (
                            <div style={{ minWidth }}>
                              <Unknown record={record} />
                            </div>
                          );
                        }
                        return (
                          <div style={{ minWidth }} className='w-[90px] leading-none'>
                            <div
                              className={classNames('leading-[18px]', {
                                'text-soft': record.target_up === 0,
                                'text-title': record.target_up !== 0,
                              })}
                            >
                              {val.toFixed(1)} %
                            </div>
                            <N9EProgress percent={val} strokeColor={getStrokeColor(val)} trailColor={getTrailColor(val)} status={record.target_up === 0 ? 'inactive' : 'default'} />
                          </div>
                        );
                      },
                    },
                    {
                      dataIndex: 'cpu_util',
                      title: 'CPU',
                      render: (val: number, record) => {
                        const minWidth = getTextWidth('CPU') + 4;
                        if (record.cpu_num === -1 || !_.isNumber(val)) {
                          return (
                            <div style={{ minWidth }}>
                              <Unknown record={record} />
                            </div>
                          );
                        }
                        return (
                          <div style={{ minWidth }} className='w-[90px] leading-none'>
                            <div
                              className={classNames('leading-[18px]', {
                                'text-soft': record.target_up === 0,
                                'text-title': record.target_up !== 0,
                              })}
                            >
                              {val.toFixed(1)} %
                            </div>
                            <N9EProgress percent={val} strokeColor={getStrokeColor(val)} trailColor={getTrailColor(val)} status={record.target_up === 0 ? 'inactive' : 'default'} />
                          </div>
                        );
                      },
                    },
                    {
                      dataIndex: 'offset',
                      title: (
                        <Space>
                          {t('offset')}
                          <Tooltip title={t('offset_tip')}>
                            <QuestionCircleOutlined />
                          </Tooltip>
                        </Space>
                      ),
                      render: (val, record) => {
                        const minWidth = getTextWidth(t('offset')) + 24;
                        if (record.cpu_num === -1 || !_.isNumber(val)) {
                          return (
                            <div style={{ minWidth }}>
                              <Unknown record={record} />
                            </div>
                          );
                        }
                        let backgroundColor = 'var(--fc-fill-error)';
                        if (Math.abs(val) < 2000) {
                          backgroundColor = 'var(--fc-fill-alert)';
                        }
                        if (Math.abs(val) < 1000) {
                          backgroundColor = 'var(--fc-fill-success)';
                        }
                        if (record.target_up === 0) {
                          backgroundColor = 'rgb(var(--fc-fill-5-rgb) / 0.6)';
                        }
                        return (
                          <div style={{ minWidth }}>
                            <Space size={8} align='start'>
                              <div className='w-[4px] h-[16px] rounded relative top-[2px]' style={{ backgroundColor }} />
                              <div
                                className={classNames({
                                  'text-soft': record.target_up === 0,
                                  'text-title': record.target_up !== 0,
                                })}
                              >
                                {timeFormatter(val, 'milliseconds', 2)?.text}
                              </div>
                            </Space>
                          </div>
                        );
                      },
                    },
                    {
                      dataIndex: 'remote_addr',
                      title: (
                        <Space>
                          {t('remote_addr')}
                          <Tooltip title={t('remote_addr_tip')}>
                            <QuestionCircleOutlined />
                          </Tooltip>
                        </Space>
                      ),
                      render: (val, record: Item) => {
                        const minWidth = getTextWidth(t('remote_addr')) + 24;
                        return (
                          <div
                            style={{ minWidth }}
                            className={classNames({
                              'text-soft': record.target_up === 0,
                              'text-title': record.target_up !== 0,
                            })}
                          >
                            {val}
                          </div>
                        );
                      },
                    },
                    {
                      dataIndex: 'note',
                      title: t('note'),
                      render: (val) => {
                        const minWidth = getTextWidth(t('note')) + 24;
                        const maxWidth = 100;
                        const displayVal = val ?? '-';
                        return (
                          <Tooltip title={displayVal === '-' ? undefined : displayVal}>
                            <div
                              style={{ minWidth, maxWidth }}
                              className={classNames('truncate', {
                                'text-soft': displayVal === '-',
                              })}
                            >
                              {displayVal}
                            </div>
                          </Tooltip>
                        );
                      },
                    },
                  ],
            ) as any[]
          }
        />
      </div>
      <TargetMetaDrawer
        ident={metaDrawerIdent}
        drawerOnly
        drawerOpen={metaDrawerOpen}
        onDrawerOpenChange={(open) => {
          setMetaDrawerOpen(open);
          if (!open) setMetaDrawerIdent('');
        }}
      />
      <CollectsDrawer visible={collectsDrawerVisible} setVisible={setCollectsDrawerVisible} ident={collectsDrawerIdent} />
      {installVisible && installMeta && (
        <InstallCategraf
          meta={installMeta}
          onClose={(detected) => {
            setInstallVisible(false);
            // 只有确实检测到新机器才刷新，避免随手打开又关闭时无谓地重拉列表
            if (detected) setRefreshFlag(_.uniqueId('refreshFlag_'));
          }}
        />
      )}
      {upgradeTargetIdent && (
        <UpgradeAgent
          selectedIdents={[upgradeTargetIdent]}
          visible
          onVisibleChange={(v) => {
            if (!v) setUpgradeTargetIdent(null);
          }}
          onOk={() => {
            setUpgradeTargetIdent(null);
            setRefreshFlag(_.uniqueId('refreshFlag_'));
          }}
        />
      )}
    </>
  );
}
