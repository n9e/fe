import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Button, Table, Dropdown, Menu, Drawer, Space } from 'antd';
import { MoreOutlined, CloseOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import queryString from 'query-string';
import { useAntdTable } from 'ahooks';

import { CommonStateContext } from '@/App';
import { parseRange } from '@/components/TimeRangePicker';
import DetailNG from '@/pages/event/DetailNG';
import getActions from '@/pages/event/DetailNG/Actions';
import usePagination from '@/components/usePagination';
import { allCates } from '@/components/AdvancedWrap/utils';
import { IS_PLUS } from '@/utils/constant';

import { getEvents, getEventById } from '../../services';
import deleteAlertEventsModal from '../../utils/deleteAlertEventsModal';
import { NS, SEVERITY_COLORS, EVENTS_TABLE_PAGESIZE_CACHE_KEY } from '../../constants';
import { FilterType } from '../../types';

// @ts-ignore
import AckBtn from 'plus:/parcels/Event/Acknowledge/AckBtn';

interface IProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  params: any;
  refreshFlag: string;
  selectedRowKeys: number[];
  setSelectedRowKeys: (selectedRowKeys: number[]) => void;
  setRefreshFlag: (refreshFlag: string) => void;
}

function formatDuration(ms: number) {
  const d = moment.duration(ms);
  const totalDays = d.asDays();
  const totalHours = d.asHours();
  const totalMinutes = d.asMinutes();

  if (totalDays >= 1) {
    return `${totalDays.toFixed(1)} d`;
  } else {
    const hours = Math.floor(totalHours);
    const minutes = totalMinutes % 60;

    let result: string[] = [];
    if (hours > 0) {
      result.push(`${hours} h`);
    }
    if (minutes > 0 || hours === 0) {
      result.push(`${minutes.toFixed(1)} min`);
    }
    return result.join(' ');
  }
}

export default function AlertTable(props: IProps) {
  const { filter, setFilter, selectedRowKeys, setSelectedRowKeys, params, setRefreshFlag } = props;
  const history = useHistory();
  const { t } = useTranslation(NS);
  const { datasourceList } = useContext(CommonStateContext);
  const [openAlertDetailDrawer, setOpenAlertDetailDrawer] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const columns = [
    {
      title: t('event_name'),
      dataIndex: 'rule_name',
      render(title, record) {
        const currentDatasourceCate = _.find(allCates, { value: record.cate });
        const currentDatasource = _.find(datasourceList, { id: record.datasource_id });

        return (
          <div className='max-w-[60vw]'>
            <div className='mb-2'>
              <Space>
                {currentDatasourceCate && currentDatasource ? (
                  <Space>
                    <img src={currentDatasourceCate.logo} height={14} />
                    {currentDatasource.name}
                    <span>/</span>
                  </Space>
                ) : record.cate === 'host' ? (
                  <Space>
                    <img src='/image/logos/host.png' height={14} />
                    <span>/</span>
                  </Space>
                ) : null}
                <a
                  onClick={() => {
                    getEventById(record.id).then((res) => {
                      setCurrentRecord(res.dat);
                      setOpenAlertDetailDrawer(true);
                    });
                  }}
                >
                  {title}
                </a>
              </Space>
            </div>
            <div>
              {_.map(record.tags, (item) => {
                return (
                  <Tag
                    key={item}
                    style={{ maxWidth: '100%' }}
                    onClick={() => {
                      if (!_.includes(filter.query, item)) {
                        setFilter({
                          ...filter,
                          query: filter.query ? `${filter.query.trim()} ${item}` : item,
                        });
                      }
                    }}
                  >
                    <div
                      style={{
                        maxWidth: 'max-content',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item}
                    </div>
                  </Tag>
                );
              })}
            </div>
          </div>
        );
      },
    },
    {
      title: t('trigger_time'),
      dataIndex: 'trigger_time',
      fixed: 'right' as const,
      render(value) {
        return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: t('duration'),
      dataIndex: 'duration',
      fixed: 'right' as const,
      render(_, record) {
        const duration = moment().diff(moment(record.first_trigger_time * 1000));
        const maxGrids = 12;
        const hours = duration / 3600000;
        const highlight = hours >= 24 ? maxGrids : Math.floor(hours / 2);
        const getColorClass = (idx: number) => {
          if (idx < 4) return 'gold';
          if (idx < 8) return 'orange';
          return 'red';
        };
        return (
          <div>
            {formatDuration(duration)}
            <div className='flex gap-[2px]'>
              {Array.from({ length: maxGrids }).map((_, idx) => {
                const colorClass = getColorClass(idx);
                const isActive = idx < highlight;
                return <div key={idx} className={`duration-bar-segment ${colorClass} ${isActive ? 'active' : 'inactive'}`} />;
              })}
            </div>
          </div>
        );
      },
    },
    {
      title: t('common:table.operations'),
      fixed: 'right' as const,
      render(record) {
        return (
          <Dropdown
            overlay={
              <Menu>
                {IS_PLUS && (
                  <Menu.Item>
                    <AckBtn
                      data={record}
                      onOk={() => {
                        setRefreshFlag(_.uniqueId('refresh_'));
                      }}
                    />
                  </Menu.Item>
                )}
                {!_.includes(['firemap', 'northstar'], record?.rule_prod) && (
                  <Menu.Item>
                    <Button
                      style={{ padding: 0 }}
                      size='small'
                      type='link'
                      onClick={() => {
                        history.push({
                          pathname: '/alert-mutes/add',
                          search: queryString.stringify({
                            busiGroup: record.group_id,
                            prod: record.rule_prod,
                            cate: record.cate,
                            datasource_ids: [record.datasource_id],
                            tags: record.tags,
                          }),
                        });
                      }}
                    >
                      {t('shield')}
                    </Button>
                  </Menu.Item>
                )}
                <Menu.Item>
                  <Button
                    style={{ padding: 0 }}
                    size='small'
                    type='link'
                    danger
                    onClick={() =>
                      deleteAlertEventsModal(
                        [record.id],
                        () => {
                          setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.id));
                          setRefreshFlag(_.uniqueId('refresh_'));
                        },
                        t,
                      )
                    }
                  >
                    {t('common:btn.delete')}
                  </Button>
                </Menu.Item>
              </Menu>
            }
          >
            <Button type='link' icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  if (import.meta.env.VITE_IS_PRO === 'true') {
    columns.splice(3, 0, {
      title: t('claimant'),
      dataIndex: 'claimant',
      fixed: 'right',
      render: (value, record) => {
        if (record.status === 1) {
          return value;
        }
        return t('status_0');
      },
    });
  }

  const fetchData = ({ current, pageSize }) => {
    const requestParams: any = {
      p: current,
      limit: pageSize,
      my_groups: String(params.my_groups) === 'true',
      ..._.omit(params, ['range', 'my_groups']),
    };

    if (params.range) {
      const parsedRange = parseRange(params.range);
      requestParams.stime = moment(parsedRange.start).unix();
      requestParams.etime = moment(parsedRange.end).unix();
    }
    return getEvents(requestParams).then((res) => {
      return {
        total: res.dat.total,
        list: res.dat.list,
      };
    });
  };
  const { tableProps } = useAntdTable(fetchData, {
    refreshDeps: [JSON.stringify(params), props.refreshFlag],
    defaultPageSize: 30,
    debounceWait: 500,
  });

  const pagination = usePagination({ PAGESIZE_KEY: EVENTS_TABLE_PAGESIZE_CACHE_KEY });

  return (
    <>
      <Table
        className='mt8'
        size='small'
        tableLayout='auto'
        scroll={!_.isEmpty(tableProps.dataSource) ? { x: 'max-content' } : undefined} // TODO: 临时解决空数据时会出现滚动条问题
        rowKey={(record) => record.id}
        columns={columns}
        {...tableProps}
        rowClassName={(record: { severity: number; is_recovered: number }) => {
          return SEVERITY_COLORS[record.is_recovered ? 3 : record.severity - 1] + '-left-border';
        }}
        rowSelection={{
          selectedRowKeys: selectedRowKeys,
          onChange(selectedRowKeys: number[]) {
            setSelectedRowKeys(selectedRowKeys);
          },
        }}
        pagination={{
          ...pagination,
          ...tableProps.pagination,
          pageSizeOptions: ['30', '100', '200', '500'],
        }}
      />
      <Drawer
        width='80%'
        closable={false}
        title={t('title')}
        destroyOnClose
        extra={<CloseOutlined onClick={() => setOpenAlertDetailDrawer(false)} />}
        onClose={() => setOpenAlertDetailDrawer(false)}
        visible={openAlertDetailDrawer}
        footer={getActions({
          eventDetail: currentRecord,
          showDeleteBtn: true,
          onDeleteSuccess: () => {
            setOpenAlertDetailDrawer(false);
            setRefreshFlag(_.uniqueId('refresh_'));
            setSelectedRowKeys([]);
          },
        })}
      >
        {currentRecord && <DetailNG data={currentRecord} showGraph />}
      </Drawer>
    </>
  );
}
