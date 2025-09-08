import React, { useContext, useState } from 'react';
import { SearchOutlined, MoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import _ from 'lodash';
import { useAntdTable } from 'ahooks';
import { Input, Tag, Button, Space, Table, Select, Dropdown, Menu, message } from 'antd';
import queryString from 'query-string';
import { useHistory } from 'react-router-dom';

import RefreshIcon from '@/components/RefreshIcon';
import { CommonStateContext } from '@/App';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import TimeRangePicker, { parseRange } from '@/components/TimeRangePicker';
import { IS_ENT, IS_PLUS } from '@/utils/constant';
import getTextWidth from '@/utils/getTextWidth';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
import { allCates } from '@/components/AdvancedWrap/utils';
import EventDetailDrawer from '@/pages/alertCurEvent/pages/List/EventDetailDrawer';
import usePagination from '@/components/usePagination';
import { getEventById } from '@/pages/alertCurEvent/services';
import deleteAlertEventsModal from '@/pages/alertCurEvent/utils/deleteAlertEventsModal';

import exportEvents, { downloadFile } from '../exportEvents';
import { SeverityColor } from '../../event';

// @ts-ignore
import AckBtn from 'plus:/parcels/Event/Acknowledge/AckBtn';

export const CACHE_KEY = 'alert_events_range';

interface Props {
  showClaimant?: boolean;
  hideHeader?: boolean;
  hideTimeRangePicker?: boolean;
  hideExportButton?: boolean;
  filter: any;
  setFilter: (newFilter: any) => void;
  fetchData: (
    params: { current: number; pageSize: number },
    filterObj: any,
  ) => Promise<{
    total: any;
    list: any;
  }>;
  filterAreaRight?: React.ReactNode;
  refreshFlag?: string;
  rowSelection?: any;
}

const Event = (props: Props) => {
  const { t } = useTranslation('AlertHisEvents');
  const history = useHistory();
  const { feats, datasourceList } = useContext(CommonStateContext);
  const { hideHeader = false, hideTimeRangePicker = false, hideExportButton = false, filter, setFilter, fetchData, filterAreaRight, rowSelection, showClaimant = false } = props;
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [eventDetailDrawerData, setEventDetailDrawerData] = useState<{
    visible: boolean;
    data?: any;
  }>({
    visible: false,
  });
  let columns = [
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
                      setEventDetailDrawerData({
                        visible: true,
                        data: res.dat,
                      });
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
      title: t('first_trigger_time'),
      dataIndex: 'first_trigger_time',
      fixed: 'right' as const,
      render(value) {
        return moment((value ? value : 0) * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: t('last_eval_time'),
      dataIndex: 'last_eval_time',
      fixed: 'right' as const,
      render(value) {
        return moment((value ? value : 0) * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];
  if (showClaimant) {
    columns = _.concat(columns, [
      {
        title: t('claimant'),
        dataIndex: 'claimant',
        fixed: 'right',
        render: (value, record) => {
          return (
            <div
              style={{
                minWidth: getTextWidth(t('claimant')),
              }}
            >
              {record.status === 1 ? value : t('alert-cur-events:status_0')}
            </div>
          );
        },
      },
      {
        title: t('common:table.operations'),
        fixed: 'right' as const,
        render(record) {
          return (
            <div
              style={{
                minWidth: getTextWidth(t('common:table.operations')),
              }}
            >
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
            </div>
          );
        },
      },
    ] as any[]);
  }
  const [exportBtnLoadding, setExportBtnLoadding] = useState(false);
  const pagination = usePagination({ PAGESIZE_KEY: 'alert_his_events_table_pagesize' });

  let prodOptions = getProdOptions(feats);
  if (IS_ENT) {
    prodOptions = [
      ...prodOptions,
      {
        label: t('rule_prod.firemap'),
        value: 'firemap',
        pro: false,
      },
      {
        label: t('rule_prod.northstar'),
        value: 'northstar',
        pro: false,
      },
    ];
  }

  const filterObj = Object.assign(
    { range: filter.range },
    filter.datasource_ids?.length ? { datasource_ids: _.join(filter.datasource_ids, ',') } : {},
    filter.severity !== undefined ? { severity: filter.severity } : {},
    filter.query ? { query: filter.query } : {},
    filter.is_recovered !== undefined ? { is_recovered: filter.is_recovered } : {},
    { bgid: filter.bgid },
    filter.rule_prods?.length ? { rule_prods: _.join(filter.rule_prods, ',') } : {},
  );

  const { tableProps } = useAntdTable(
    (params) => {
      return fetchData(params, filterObj);
    },
    {
      refreshDeps: [refreshFlag, JSON.stringify(filterObj), props.refreshFlag],
      defaultPageSize: 30,
      debounceWait: 500,
    },
  );

  return (
    <>
      {!hideHeader && (
        <div className='flex justify-between items-center'>
          <Space wrap>
            {!hideTimeRangePicker && (
              <>
                <RefreshIcon
                  onClick={() => {
                    setRefreshFlag(_.uniqueId('refresh_'));
                  }}
                />
                <TimeRangePicker
                  localKey={CACHE_KEY}
                  value={filter.range}
                  onChange={(val) => {
                    setFilter({
                      ...filter,
                      range: val,
                    });
                  }}
                  dateFormat='YYYY-MM-DD HH:mm:ss'
                />
              </>
            )}
            <Select
              allowClear
              placeholder={t('prod')}
              style={{ minWidth: 80 }}
              value={filter.rule_prods}
              mode='multiple'
              onChange={(val) => {
                setFilter({
                  ...filter,
                  rule_prods: val,
                });
              }}
              dropdownMatchSelectWidth={false}
            >
              {prodOptions.map((item) => {
                return (
                  <Select.Option value={item.value} key={item.value}>
                    {item.label}
                  </Select.Option>
                );
              })}
            </Select>
            <DatasourceSelect
              style={{ width: 100 }}
              filterKey='alertRule'
              value={filter.datasource_ids}
              onChange={(val: number[]) => {
                setFilter({
                  ...filter,
                  datasource_ids: val,
                });
              }}
            />
            <BusinessGroupSelectWithAll
              value={filter.bgid}
              onChange={(val: number) => {
                setFilter({
                  ...filter,
                  bgid: val,
                });
              }}
            />
            <Select
              style={{ minWidth: 60 }}
              placeholder={t('severity')}
              allowClear
              value={filter.severity}
              onChange={(val) => {
                setFilter({
                  ...filter,
                  severity: val,
                });
              }}
              dropdownMatchSelectWidth={false}
            >
              <Select.Option value={1}>S1（Critical）</Select.Option>
              <Select.Option value={2}>S2（Warning）</Select.Option>
              <Select.Option value={3}>S3（Info）</Select.Option>
            </Select>
            <Select
              style={{ minWidth: 60 }}
              placeholder={t('eventType')}
              allowClear
              value={filter.is_recovered}
              onChange={(val) => {
                setFilter({
                  ...filter,
                  is_recovered: val,
                });
              }}
            >
              <Select.Option value={0}>Triggered</Select.Option>
              <Select.Option value={1}>Recovered</Select.Option>
            </Select>
            <Input
              className='min-w-[300px]'
              prefix={<SearchOutlined />}
              placeholder={t('search_placeholder')}
              value={filter.query}
              onChange={(e) => {
                setFilter({
                  ...filter,
                  query: e.target.value,
                });
              }}
              onPressEnter={(e) => {
                setRefreshFlag(_.uniqueId('refresh_'));
              }}
            />
            {!hideExportButton && (
              <Button
                loading={exportBtnLoadding}
                onClick={() => {
                  setExportBtnLoadding(true);
                  const parsedRange = parseRange(filterObj.range);
                  exportEvents(
                    { ..._.omit(filterObj, 'range'), stime: moment(parsedRange.start).unix(), etime: moment(parsedRange.end).unix(), limit: 1000000, p: 1 },
                    (err, csv) => {
                      if (err) {
                        message.error(t('export_failed'));
                      } else {
                        downloadFile(csv, `events_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
                      }
                      setExportBtnLoadding(false);
                    },
                  );
                }}
              >
                {t('export')}
              </Button>
            )}
          </Space>
          {filterAreaRight}
        </div>
      )}
      <Table
        className='mt-4 n9e-antd-table-with-border-collapse'
        size='small'
        tableLayout='auto'
        scroll={!_.isEmpty(tableProps.dataSource) ? { x: 'max-content' } : undefined}
        columns={columns}
        rowKey='id'
        {...tableProps}
        rowClassName={(record: { severity: number; is_recovered: number }) => {
          return SeverityColor[record.is_recovered ? 3 : record.severity - 1] + '-left-border';
        }}
        pagination={{
          ...pagination,
          ...tableProps.pagination,
          pageSizeOptions: ['30', '100', '200', '500'],
        }}
        rowSelection={rowSelection}
      />
      <EventDetailDrawer
        showDeleteBtn={false}
        showAckBtn
        visible={eventDetailDrawerData.visible}
        data={eventDetailDrawerData.data}
        onClose={() => setEventDetailDrawerData({ visible: false })}
        onDeleteSuccess={() => {
          setRefreshFlag(_.uniqueId('refresh_'));
        }}
        onRefresh={() => {
          if (eventDetailDrawerData.data.id) {
            getEventById(eventDetailDrawerData.data.id).then((res) => {
              setEventDetailDrawerData({
                visible: true,
                data: res.dat,
              });
            });
          }
        }}
      />
    </>
  );
};

export default Event;
