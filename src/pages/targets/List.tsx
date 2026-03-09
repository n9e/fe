import React, { useState, useRef, useEffect, useContext } from 'react';
import { Table, Tag, Space, Input, Dropdown, Menu, Button, Modal, message, Select } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { SearchOutlined, DownOutlined, ReloadOutlined, CopyOutlined, ApartmentOutlined, InfoCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useAntdTable } from 'ahooks';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation, Trans } from 'react-i18next';

import { getMonObjectList } from '@/services/targets';
import { timeFormatter } from '@/pages/dashboard/Renderer/utils/valueFormatter';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import DocumentDrawer from '@/components/DocumentDrawer';

import clipboard from './clipboard';
import { getOffsetStatusTone, getStatusToneStyle, getUpdateAtStatusTone, getUsageStatusTone } from './display';
import OrganizeColumns from './OrganizeColumns';
import { getDefaultColumnsConfigs, setDefaultColumnsConfigs } from './utils';
import TargetMetaDrawer from './TargetMetaDrawer';
import Explorer from './components/Explorer';
import EditBusinessGroups from './components/EditBusinessGroups';
import HostsSelect from './components/HostsSelect';
import Tooltip from '@/components/v2/Tooltip';

// @ts-ignore
import CollectsDrawer from 'plus:/pages/collects/CollectsDrawer';
// @ts-ignore
import UpgradeAgent from 'plus:/parcels/Targets/UpgradeAgent';
// @ts-ignore
import VersionSelect from 'plus:/parcels/Targets/VersionSelect';
// @ts-ignore
import { extraColumns } from 'plus:/parcels/Targets';

export const pageSizeOptions = ['10', '20', '50', '100'];

enum OperateType {
  BindTag = 'bindTag',
  UnbindTag = 'unbindTag',
  UpdateBusi = 'updateBusi',
  RemoveBusi = 'removeBusi',
  UpdateNote = 'updateNote',
  Delete = 'delete',
  None = 'none',
}

export interface ITargetProps {
  id: number;
  cluster: string;
  group_id: number;
  group_objs: object[] | null;
  ident: string;
  note: string;
  tags: string[];
  beat_time: number;
}

interface IProps {
  editable?: boolean;
  explorable?: boolean;
  gids?: string;
  selectedRows: ITargetProps[];
  setSelectedRows: (selectedRowKeys: ITargetProps[]) => void;
  refreshFlag: string;
  setRefreshFlag: (refreshFlag: string) => void;
  setOperateType?: (operateType: OperateType) => void;
}

const downtimeOptions = [1, 2, 3, 5, 10, 30];
const TAG_CLASS_NAME = 'fc-tag-default';

const Unknown = () => {
  const { t } = useTranslation('targets');
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span>unknown</span>
      </Tooltip.Trigger>
      <Tooltip.Content>{t('unknown_tip')}</Tooltip.Content>
    </Tooltip.Root>
  );
};

export default function List(props: IProps) {
  const { t, i18n } = useTranslation('targets');
  const pagination = usePagination({ PAGESIZE_KEY: 'targets' });
  const { darkMode } = useContext(CommonStateContext);
  const { editable = true, explorable = true, gids, selectedRows, setSelectedRows, refreshFlag, setRefreshFlag, setOperateType } = props;
  const selectedIdents = _.map(selectedRows, 'ident');
  const isAddTagToQueryInput = useRef(false);
  const [searchVal, setSearchVal] = useState('');
  const [tableQueryContent, setTableQueryContent] = useState<string>('');
  const [columnsConfigs, setColumnsConfigs] = useState<{ name: string; visible: boolean }[]>(getDefaultColumnsConfigs());
  const [collectsDrawerVisible, setCollectsDrawerVisible] = useState(false);
  const [collectsDrawerIdent, setCollectsDrawerIdent] = useState('');
  const [downtime, setDowntime] = useState();
  const [agentVersions, setAgentVersions] = useState<string>();
  const [hosts, setHosts] = useState<string>();
  const sorterRef = useRef<any>();
  const renderStatusCell = (content: React.ReactNode, tone: ReturnType<typeof getUsageStatusTone>) => {
    return (
      <div className='table-td-fullBG' style={getStatusToneStyle(tone)}>
        {content}
      </div>
    );
  };

  // 无背景色，仅文字着色（用于时间偏移）
  const renderStatusTextOnly = (content: React.ReactNode, tone: ReturnType<typeof getUsageStatusTone>) => {
    const style = getStatusToneStyle(tone);
    return <span style={{ color: style.color }}>{content}</span>;
  };

  // 数字加进度条（用于内存、CPU）
  const renderProgressStatus = (value: number, tone: ReturnType<typeof getUsageStatusTone>) => {
    const style = getStatusToneStyle(tone);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%', minWidth: 50 }}>
        <span style={{ color: style.color, lineHeight: 1 }}>{_.floor(value, 1)}%</span>
        <div style={{ width: '100%', height: 4, backgroundColor: 'var(--fc-border-color)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, height: '100%', backgroundColor: style.color }} />
        </div>
      </div>
    );
  };

  // 更新时间：正常字体颜色 + 带颜色的实心小圆 indicator
  const renderUpdateAtWithIndicator = (content: React.ReactNode, tone: ReturnType<typeof getUpdateAtStatusTone>) => {
    const style = getStatusToneStyle(tone);
    return (
      <span className='n9e-hosts-table-update-at'>
        <span className='n9e-hosts-table-update-at-indicator-wrap'>
          <span className='n9e-hosts-table-update-at-indicator-wave n9e-hosts-table-update-at-indicator-wave-1' style={{ backgroundColor: style.color }} />
          <span className='n9e-hosts-table-update-at-indicator-wave n9e-hosts-table-update-at-indicator-wave-2' style={{ backgroundColor: style.color }} />
          <span className='n9e-hosts-table-update-at-indicator' style={{ backgroundColor: style.color }} />
        </span>
        {content}
      </span>
    );
  };

  const renderQueryTag = (label: string, onClick?: () => void) => {
    return (
      <Tag className={TAG_CLASS_NAME} key={label} onClick={onClick}>
        {label}
      </Tag>
    );
  };

  const renderGroupTag = (label: string) => {
    return (
      <Tag className='fc-tag-primary' key={label}>
        {label}
      </Tag>
    );
  };

  const updateAtColumn = {
    className: 'n9e-hosts-table-column-update-at',
    title: (
      <Space>
        {t('update_at')}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <span>
              <InfoCircleOutlined />
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <Trans ns='targets' i18nKey='update_at_tip' components={{ 1: <br /> }} />
          </Tooltip.Content>
        </Tooltip.Root>
      </Space>
    ),
    dataIndex: 'beat_time',
    render: (val, reocrd) => {
      const result = moment.unix(val).format('YYYY-MM-DD HH:mm:ss');
      return renderUpdateAtWithIndicator(result, getUpdateAtStatusTone(reocrd.target_up));
    },
  };

  const isUpdateAtVisible = _.find(columnsConfigs, { name: 'update_at' })?.visible;

  const columns: ColumnsType<any> = [
    ...(isUpdateAtVisible ? [updateAtColumn] : []),
    {
      title: (
        <Space>
          {t('common:table.ident')}
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
                  const copySucceeded = clipboard(tobeCopyStr);

                  if (copySucceeded) {
                    message.success(t('ident_copy_success', { num: tobeCopy.length }));
                  } else {
                    Modal.warning({
                      title: t('host.copy.error'),
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
            <CopyOutlined
              style={{
                cursor: 'pointer',
              }}
            />
          </Dropdown>
        </Space>
      ),
      dataIndex: 'ident',
      className: 'n9e-hosts-table-column-ident',
      onHeaderCell: () => ({
        className: 'n9e-hosts-table-ident-header',
      }),
      render: (text, record) => {
        return (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <div className='n9e-hosts-table-ident-cell'>
              <div className='flex items-center gap-2'>
                <div className='n9e-hosts-table-ident-line'>{text ? <TargetMetaDrawer ident={text} /> : '-'}</div>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <span>
                      <ApartmentOutlined
                        onClick={() => {
                          setCollectsDrawerVisible(true);
                          setCollectsDrawerIdent(text);
                        }}
                      />
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Content>查看告警关联</Tooltip.Content>
                </Tooltip.Root>
              </div>
              {record?.host_ip != null && record.host_ip !== '' && (
                <div className='n9e-hosts-table-ip-line'>
                  <span>{record.host_ip}</span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  _.forEach(columnsConfigs, (item) => {
    if (!item.visible) return;
    if (item.name === 'host_ip' || item.name === 'update_at') return;
    if (item.name === 'host_tags') {
      columns.push({
        title: (
          <Space>
            {t('common:host.host_tags')}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>
                  <InfoCircleOutlined />
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>{t('common:host.host_tags_tip')}</Tooltip.Content>
            </Tooltip.Root>
          </Space>
        ),
        dataIndex: 'host_tags',
        className: 'n9e-hosts-table-column-tags',
        ellipsis: {
          showTitle: false,
        },
        render(tagArr) {
          const content =
            tagArr &&
            tagArr.map((item) =>
              renderQueryTag(item, () => {
                if (!tableQueryContent.includes(item)) {
                  isAddTagToQueryInput.current = true;
                  const val = tableQueryContent ? `${tableQueryContent.trim()} ${item}` : item;
                  setTableQueryContent(val);
                  setSearchVal(val);
                }
              }),
            );
          return (
            tagArr && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span>{content}</span>
                </Tooltip.Trigger>
                <Tooltip.Content>{content}</Tooltip.Content>
              </Tooltip.Root>
            )
          );
        },
      });
    }
    if (item.name === 'tags') {
      columns.push({
        title: (
          <Space>
            {t('common:host.tags')}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>
                  <InfoCircleOutlined />
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>{t('common:host.tags_tip')}</Tooltip.Content>
            </Tooltip.Root>
          </Space>
        ),
        dataIndex: 'tags',
        className: 'n9e-hosts-table-column-tags',
        ellipsis: {
          showTitle: false,
        },
        render(tagArr) {
          const content =
            tagArr &&
            tagArr.map((item) =>
              renderQueryTag(item, () => {
                if (!tableQueryContent.includes(item)) {
                  isAddTagToQueryInput.current = true;
                  const val = tableQueryContent ? `${tableQueryContent.trim()} ${item}` : item;
                  setTableQueryContent(val);
                  setSearchVal(val);
                }
              }),
            );
          return (
            tagArr && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span>{content}</span>
                </Tooltip.Trigger>
                <Tooltip.Content side='top' align='start' className='mon-manage-table-tooltip'>
                  {content}
                </Tooltip.Content>
              </Tooltip.Root>
            )
          );
        },
      });
    }
    if (item.name === 'group_obj') {
      columns.push({
        title: t('group_obj'),
        dataIndex: 'group_objs',
        className: 'n9e-hosts-table-column-tags',
        ellipsis: {
          showTitle: false,
        },
        render(tagArr) {
          if (_.isEmpty(tagArr)) return t('common:not_grouped');
          const content = tagArr && tagArr.map((item) => renderGroupTag(item.name));
          return (
            tagArr && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span>{content}</span>
                </Tooltip.Trigger>
                <Tooltip.Content side='top' align='start'>
                  {content}
                </Tooltip.Content>
              </Tooltip.Root>
            )
          );
        },
      });
    }
    if (item.name === 'mem_util') {
      columns.push({
        title: t('mem_util'),
        dataIndex: 'mem_util',
        render(text, reocrd) {
          if (reocrd.cpu_num === -1) return <Unknown />;
          return renderProgressStatus(text, getUsageStatusTone(text, reocrd.target_up));
        },
      });
    }
    if (item.name === 'cpu_util') {
      columns.push({
        title: t('cpu_util'),
        dataIndex: 'cpu_util',
        render(text, reocrd) {
          if (reocrd.cpu_num === -1) return <Unknown />;
          return renderProgressStatus(text, getUsageStatusTone(text, reocrd.target_up));
        },
      });
    }
    if (item.name === 'cpu_num') {
      columns.push({
        title: t('cpu_num'),
        dataIndex: 'cpu_num',
        render: (val, reocrd) => {
          if (reocrd.cpu_num === -1) return <Unknown />;
          return val;
        },
      });
    }
    if (item.name === 'offset') {
      columns.push({
        title: (
          <Space>
            {t('offset')}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>
                  <InfoCircleOutlined />
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>{t('offset_tip')}</Tooltip.Content>
            </Tooltip.Root>
          </Space>
        ),
        dataIndex: 'offset',
        render(text, reocrd) {
          if (reocrd.cpu_num === -1) return <Unknown />;
          return renderStatusTextOnly(timeFormatter(text, 'milliseconds', 2)?.text, getOffsetStatusTone(text, reocrd.target_up));
        },
      });
    }
    if (item.name === 'os') {
      columns.push({
        title: t('os'),
        dataIndex: 'os',
        render: (val, reocrd) => {
          if (reocrd.cpu_num === -1) return <Unknown />;
          return val;
        },
      });
    }
    if (item.name === 'arch') {
      columns.push({
        title: t('arch'),
        dataIndex: 'arch',
        render: (val, reocrd) => {
          if (reocrd.cpu_num === -1) return <Unknown />;
          return val;
        },
      });
    }
    if (item.name === 'remote_addr') {
      columns.push({
        title: (
          <Space>
            {t('remote_addr')}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>
                  <InfoCircleOutlined />
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>{t('remote_addr_tip')}</Tooltip.Content>
            </Tooltip.Root>
          </Space>
        ),
        dataIndex: 'remote_addr',
        render: (val, reocrd) => {
          if (reocrd.cpu_num === -1) return <Unknown />;
          return val;
        },
      });
    }
    extraColumns(item.name, columns);
    if (item.name === 'note') {
      columns.push({
        title: t('common:table.note'),
        dataIndex: 'note',
        ellipsis: {
          showTitle: false,
        },
        render(note) {
          return (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>{note}</span>
              </Tooltip.Trigger>
              <Tooltip.Content side='top' align='start'>
                {note}
              </Tooltip.Content>
            </Tooltip.Root>
          );
        },
      });
    }
  });

  const featchData = ({ current, pageSize, sorter }: { current: number; pageSize: number; sorter?: any }): Promise<any> => {
    const query = {
      query: tableQueryContent,
      gids: gids,
      limit: pageSize,
      p: current,
      downtime,
      agent_versions: _.isEmpty(agentVersions) ? undefined : JSON.stringify(agentVersions),
      hosts,
      order: sorter?.field,
      desc: sorter?.field ? sorter?.order === 'descend' : undefined,
    };
    return getMonObjectList(query).then((res) => {
      return {
        total: res.dat.total,
        list: res.dat.list,
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
      sorter: sorterRef.current,
    });
  }, [tableQueryContent, gids, downtime, agentVersions, hosts]);

  useEffect(() => {
    run({
      current: tableProps.pagination.current,
      pageSize: tableProps.pagination.pageSize,
      sorter: sorterRef.current,
    });
  }, [refreshFlag]);

  return (
    <div className='targets-list-panel'>
      <div className='fc-toolbar flex flex-wrap items-center justify-between gap-3'>
        <Space size={12} wrap>
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
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onPressEnter={() => {
              setTableQueryContent(searchVal);
            }}
            onBlur={() => {
              setTableQueryContent(searchVal);
            }}
          />
          <HostsSelect
            value={hosts}
            onChange={(newHosts) => {
              setHosts(newHosts);
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
            value={downtime}
            onChange={(val) => {
              setDowntime(val);
            }}
          />
          <VersionSelect
            value={agentVersions}
            onChange={(val) => {
              setAgentVersions(val);
            }}
          />
        </Space>
        <Space size={12} wrap>
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
          {explorable && <Explorer selectedIdents={selectedIdents} />}
          <Button
            onClick={() => {
              OrganizeColumns({
                value: columnsConfigs,
                onChange: (val) => {
                  setColumnsConfigs(val);
                  setDefaultColumnsConfigs(val);
                },
              });
            }}
            icon={<EyeOutlined />}
          />
        </Space>
      </div>
      <Table
        className='fc-table n9e-hosts-table targets-table'
        rowKey='id'
        columns={columns}
        size='small'
        {...tableProps}
        showSorterTooltip={false}
        tableLayout='auto'
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: _.map(selectedRows, 'id'),
          onChange(selectedRowKeys, selectedRows: ITargetProps[]) {
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
        scroll={{ x: 'max-content' }}
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
        onChange={(pagination, filters, sorter) => {
          sorterRef.current = sorter;
          tableProps.onChange(pagination, filters, sorter);
        }}
      />
      <CollectsDrawer visible={collectsDrawerVisible} setVisible={setCollectsDrawerVisible} ident={collectsDrawerIdent} />
    </div>
  );
}
