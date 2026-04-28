import React, { useState, useEffect, useContext } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Button, Input, Space, Select, Dropdown, Menu, Table, Divider, Tooltip, Modal, message } from 'antd';
import { ReloadOutlined, SearchOutlined, DownOutlined, QuestionCircleOutlined, CopyOutlined, ApartmentOutlined } from '@ant-design/icons';
import _ from 'lodash';
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
import { getList } from '../../services';
import VersionIcon from './VersionIcon';
import Tags from './Tags';
import { formatBeatTimeDisplay } from './formatBeatTimeDisplay';

const downtimeOptions = [1, 2, 3, 5, 10, 30];

/** Fixed IP cell width sample: "IP " + longest dotted IPv4 */
const IDENT_IP_V4_MAX_SAMPLE = 'IP 255.255.255.255';
/** Fixed IP cell width sample: "IP " + long textual IPv6 */
const IDENT_IP_V6_MAX_SAMPLE = 'IP ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff';
/** Suffix for meta width: long OS + arch placeholder (cores count + t('cores') prepended in render) */
const IDENT_META_MAX_SAMPLE_SUFFIX = 'windows aarch64';

function isHostIpLikelyIpv6(hostIp: string): boolean {
  return hostIp.trim().includes(':');
}

function Unknown() {
  const { t } = useTranslation(NS);
  return <Tooltip title={t('unknown_tip')}>Unknown</Tooltip>;
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
}

export default function List(props: Props) {
  const { t, i18n } = useTranslation(NS);
  const { darkMode } = useContext(CommonStateContext);
  const pagination = usePagination({ PAGESIZE_KEY: 'hosts-ng' });

  const { allCollapseNode, editable = true, explorable = true, gids, selectedRows, setSelectedRows, refreshFlag, setRefreshFlag, setOperateType } = props;
  const selectedIdents = _.map(selectedRows, 'ident');

  const [collectsDrawerVisible, setCollectsDrawerVisible] = useState(false);
  const [collectsDrawerIdent, setCollectsDrawerIdent] = useState('');

  const [searchValue, setSearchValue] = useState('');
  const [params, setParams] = useState<{
    limit: number;
    p: number;
    gids?: string;
    query?: string;
    hosts?: string;
    downtime?: number;
    agent_versions?: string[];
  }>({
    limit: pagination.pageSize,
    p: 1,
  });

  const featchData = ({ current, pageSize }: { current: number; pageSize: number }): Promise<any> => {
    return getList({
      gids: gids,
      limit: pageSize,
      p: current,
      query: params.query,
      downtime: params.downtime,
      agent_versions: _.isEmpty(params.agent_versions) ? undefined : JSON.stringify(params.agent_versions),
      hosts: params.hosts,
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
    run({
      current: 1,
      pageSize: tableProps.pagination.pageSize,
    });
  }, [gids, params.query, params.downtime, params.agent_versions, params.hosts]);

  useEffect(() => {
    if (refreshFlag) {
      run({
        current: tableProps.pagination.current,
        pageSize: tableProps.pagination.pageSize,
      });
    }
  }, [refreshFlag]);

  return (
    <>
      <div className='flex-shrink-0 bg-fc-100 fc-border rounded-lg p-4 flex justify-between'>
        <Space>
          {allCollapseNode}
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setRefreshFlag(_.uniqueId('refreshFlag_'));
            }}
          />
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
          <HostsSelect
            value={params.hosts}
            onChange={(newHosts) => {
              setParams((p) => ({ ...p, hosts: newHosts }));
            }}
          />
          <Select
            allowClear
            placeholder={t('filterDowntime')}
            style={{ width: 'max-content' }}
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
        </Space>
        <Space>
          {editable && (
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
          {explorable && (
            <Tooltip title={t('explorer_selected_metrics_tip')}>
              <span>
                <Explorer selectedIdents={selectedIdents} />
              </span>
            </Tooltip>
          )}
        </Space>
      </div>
      <div className='n9e-antd-table-height-full n9e-hosts-ng-table mt-4'>
        <Table
          {...tableProps}
          rowKey='id'
          size='small'
          tableLayout='auto'
          scroll={{ x: tableProps.dataSource.length > 0 ? 'max-content' : undefined, y: 'calc(100% - 38px)' }}
          locale={{
            emptyText:
              gids === undefined ? (
                <Trans
                  ns='targets'
                  i18nKey='all_no_data'
                  components={{
                    a: (
                      <a
                        onClick={() => {
                          DocumentDrawer({
                            language: i18n.language,
                            darkMode,
                            title: t('categraf_doc'),
                            documentPath: '/n9e-docs/categraf',
                          });
                        }}
                      />
                    ),
                  }}
                />
              ) : undefined,
          }}
          rowSelection={{
            type: 'checkbox',
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
          rowClassName={(record) => {
            return classNames('group', {
              'n9e-hosts-ng-table-row-offline': record.target_up === 0,
              'bg-fc-400/40': record.target_up === 0,
            });
          }}
          onRow={(record) => {
            if (record.target_up === 0) {
              return {
                title: t('host_no_heartbeat_tip'),
              };
            }

            return {};
          }}
          columns={[
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
                const osDisplay = record.os === '' ? '-' : record.os;
                const archDisplay = record.arch === '' ? '-' : record.arch;

                return (
                  <div>
                    <div className='flex items-center'>
                      <TargetMetaDrawer
                        ident={ident}
                        targetNode={
                          <span
                            className={classNames('text-main text-l1 font-semibold mb-[2px] cursor-pointer hover:underline hover:text-title', {
                              'text-soft': record.target_up === 0,
                            })}
                          >
                            {ident}
                          </span>
                        }
                      />
                      {IS_PLUS && (
                        <Tooltip title={t('view_collects')}>
                          <Button
                            className='ml-2 invisible group-hover:visible'
                            size='small'
                            icon={
                              <ApartmentOutlined
                                onClick={() => {
                                  setCollectsDrawerVisible(true);
                                  setCollectsDrawerIdent(ident);
                                }}
                              />
                            }
                          />
                        </Tooltip>
                      )}
                    </div>
                    <Space size={4} className='flex flex-wrap items-center'>
                      {record.host_ip ? (
                        <span className='inline-block min-w-0 truncate align-bottom' style={{ width: identIpWidth }}>
                          {ipDisplay}
                        </span>
                      ) : (
                        <span className='inline-block min-w-0 truncate align-bottom' style={{ width: identIpWidth }}>
                          {ipDisplay}
                        </span>
                      )}
                      <Divider type='vertical' />
                      <div className='min-w-0 flex shrink items-center gap-1' style={{ width: identMetaWidth }}>
                        {record.os === '' ? (
                          <span className='shrink-0'>-</span>
                        ) : (
                          <>
                            <img className='shrink-0 flex' src={`/image/sys_${record.os}.svg`} alt='' />
                            <span className='min-w-0 shrink truncate'>{osDisplay}</span>
                          </>
                        )}
                        <span className='min-w-0 shrink truncate'>{coresDisplay}</span>
                        <span className='min-w-0 shrink truncate'>{archDisplay}</span>
                      </div>
                      <Divider type='vertical' />
                      <div
                        className={classNames('flex items-center justify-center gap-1 py-1 px-2 rounded-[4px]', {
                          'bg-fc-200': record.agent_version !== '' && record.agent_version !== null,
                          'bg-alert/10': record.agent_version === '' || record.agent_version === null,
                          'text-alert': record.agent_version === '' || record.agent_version === null,
                          'text-soft': record.target_up === 0,
                        })}
                      >
                        <VersionIcon className='text-l2 leading-none flex' />
                        <span className='leading-none'>{record.agent_version || 'Null'}</span>
                      </div>
                    </Space>
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
              render: (tags: string[]) => {
                const minWidth = getTextWidth(t('common:host.host_tags')) + 24; // 12 的icon宽度 + 8 的间距 + 4 的容错
                if (_.isEmpty(tags)) {
                  return <div style={{ minWidth }}>-</div>;
                }
                return (
                  <div className='w-[200px]' style={{ minWidth }}>
                    <Tags
                      type='outline'
                      data={tags}
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
              render: (tags: string[]) => {
                const minWidth = getTextWidth(t('common:host.tags')) + 24;
                if (_.isEmpty(tags)) {
                  return <div style={{ minWidth }}>-</div>;
                }
                return (
                  <div className='w-[200px]' style={{ minWidth }}>
                    <Tags
                      type='outline'
                      data={tags}
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
            },
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
                      <Unknown />
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
                    className={classNames('text-main', {
                      'text-soft': record.target_up === 0,
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
                      <Unknown />
                    </div>
                  );
                }
                return (
                  <div style={{ minWidth }} className='w-[90px] leading-none'>
                    <div
                      className={classNames('text-main leading-[18px]', {
                        'text-soft': record.target_up === 0,
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
                      <Unknown />
                    </div>
                  );
                }
                return (
                  <div style={{ minWidth }} className='w-[90px] leading-none'>
                    <div
                      className={classNames('text-main leading-[18px]', {
                        'text-soft': record.target_up === 0,
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
                      <Unknown />
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
                        className={classNames('text-main', {
                          'text-soft': record.target_up === 0,
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
              render: (val) => {
                const minWidth = getTextWidth(t('remote_addr')) + 24;
                return <div style={{ minWidth }}>{val}</div>;
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
          ]}
        />
      </div>
      <CollectsDrawer visible={collectsDrawerVisible} setVisible={setCollectsDrawerVisible} ident={collectsDrawerIdent} />
    </>
  );
}
