import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Button, Table, Tooltip, Dropdown, Menu, Drawer } from 'antd';
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

import { getEvents } from '../../services';
import deleteAlertEventsModal from '../../utils/deleteAlertEventsModal';
import { NS, SEVERITY_COLORS } from '../../constants';

// @ts-ignore
import AckBtn from 'plus:/parcels/Event/Acknowledge/AckBtn';

interface IProps {
  filterObj: any;
  filter: any;
  setFilter: (filter: any) => void;
  refreshFlag: string;
  selectedRowKeys: number[];
  setSelectedRowKeys: (selectedRowKeys: number[]) => void;
}
function formatDuration(ms: number) {
  const d = moment.duration(ms);
  const days = Math.floor(d.asDays());
  const hours = d.hours();
  const minutes = d.minutes();
  const seconds = d.seconds();

  let result: string[] = [];
  if (days) result.push(`${days} d`);
  if (hours) result.push(`${hours} h`);
  if (minutes) result.push(`${minutes} min`);
  if (seconds) result.push(`${seconds} s`);

  return result.join(' ');
}

function DurationBar({ duration }: { duration: number }) {
  const maxGrids = 18;
  const hours = duration / 3600000;
  const highlight = hours >= 72 ? maxGrids : Math.floor(hours / 4);
  const getColorClass = (idx: number) => {
    if (idx < 6) return 'gold';
    if (idx < 12) return 'orange';
    return 'red';
  };

  return (
    <div className='flex gap-[2px]'>
      {Array.from({ length: maxGrids }).map((_, idx) => {
        const colorClass = getColorClass(idx);
        const isActive = idx < highlight;
        return <div key={idx} className={`duration-bar-segment ${colorClass} ${isActive ? 'active' : 'inactive'}`} />;
      })}
    </div>
  );
}
export default function AlertTable(props: IProps) {
  const { filterObj, filter, setFilter, selectedRowKeys, setSelectedRowKeys } = props;
  const history = useHistory();
  const { t } = useTranslation(NS);
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [openAlertDetailDrawer, setOpenAlertDetailDrawer] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const columns = [
    {
      title: t('common:datasource.id'),
      dataIndex: 'datasource_id',
      width: 100,
      render: (value, record) => {
        if (value === 0) {
          return '$all';
        }
        return _.find(groupedDatasourceList?.[record.cate], { id: value })?.name || '-';
      },
    },
    {
      title: t('rule_name'),
      dataIndex: 'rule_name',
      render(title, record) {
        return (
          <>
            <a
              onClick={() => {
                setCurrentRecord(record);
                setOpenAlertDetailDrawer(true);
              }}
              className='mb1'
            >
              {title}
            </a>
            <div>
              {_.map(record.tags, (item) => {
                return (
                  <Tooltip key={item} title={item}>
                    <Tag
                      style={{ maxWidth: '100%' }}
                      onClick={() => {
                        if (!filter.queryContent.includes(item)) {
                          setFilter({
                            ...filter,
                            queryContent: filter.queryContent ? `${filter.queryContent.trim()} ${item}` : item,
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
                  </Tooltip>
                );
              })}
            </div>
          </>
        );
      },
    },
    {
      title: t('trigger_time'),
      dataIndex: 'trigger_time',
      width: 120,
      render(value) {
        return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: t('duration'),
      dataIndex: 'duration',
      width: 160,
      render(_, record) {
        return (
          <div>
            {formatDuration(moment().diff(moment(record.first_trigger_time * 1000)))}
            <DurationBar duration={moment().diff(moment(record.first_trigger_time * 1000))} />
          </div>
        );
      },
    },
    {
      title: t('common:table.operations'),
      dataIndex: 'operate',
      width: 80,
      render(value, record) {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item>
                  <AckBtn
                    data={record}
                    onOk={() => {
                      setRefreshFlag(_.uniqueId('refresh_'));
                    }}
                  />
                </Menu.Item>
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
    columns.splice(4, 0, {
      title: t('claimant'),
      dataIndex: 'claimant',
      width: 100,
      render: (value, record) => {
        if (record.status === 1) {
          return value;
        }
        return t('status_0');
      },
    });
  }

  const fetchData = ({ current, pageSize }) => {
    const params: any = {
      p: current,
      limit: pageSize,
      my_groups: String(filterObj.my_groups) === 'true',
      ..._.omit(filterObj, ['range', 'my_groups']),
    };

    if (filterObj.range) {
      const parsedRange = parseRange(filterObj.range);
      params.stime = moment(parsedRange.start).unix();
      params.etime = moment(parsedRange.end).unix();
    }
    return getEvents(params).then((res) => {
      return {
        total: res.dat.total,
        list: res.dat.list,
      };
    });
  };
  const { tableProps } = useAntdTable(fetchData, {
    refreshDeps: [refreshFlag, JSON.stringify(filterObj), props.refreshFlag],
    defaultPageSize: 30,
    debounceWait: 500,
  });

  return (
    <>
      <Table
        className='mt8'
        size='small'
        tableLayout='fixed'
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
