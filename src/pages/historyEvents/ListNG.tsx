import React, { useContext, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import _ from 'lodash';
import { useAntdTable } from 'ahooks';
import { Input, Tag, Button, Space, Table, Select, message } from 'antd';

import RefreshIcon from '@/components/RefreshIcon';
import { CommonStateContext } from '@/App';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import TimeRangePicker, { parseRange } from '@/components/TimeRangePicker';
import { IS_ENT } from '@/utils/constant';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
import { allCates } from '@/components/AdvancedWrap/utils';
import EventDetailDrawer from '@/pages/alertCurEvent/pages/List/EventDetailDrawer';
import usePagination from '@/components/usePagination';
import { getEventById } from '@/pages/alertCurEvent/services';

import exportEvents, { downloadFile } from './exportEvents';
import { SeverityColor } from '../event';
import '../event/index.less';
import './locale';

export const CACHE_KEY = 'alert_events_range';

interface Props {
  showHeader?: boolean;
  filter: any;
  setFilter: (newFilter: any) => void;
  fetchData: (
    params: { current: number; pageSize: number },
    filterObj: any,
  ) => Promise<{
    total: any;
    list: any;
  }>;
}

const Event = (props: Props) => {
  const { t } = useTranslation('AlertHisEvents');
  const { feats, datasourceList } = useContext(CommonStateContext);
  const { showHeader = true, filter, setFilter, fetchData } = props;
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [eventDetailDrawerData, setEventDetailDrawerData] = useState<{
    visible: boolean;
    data?: any;
  }>({
    visible: false,
  });
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
      width: 120,
      render(value) {
        return moment((value ? value : 0) * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: t('last_eval_time'),
      dataIndex: 'last_eval_time',
      width: 120,
      render(value) {
        return moment((value ? value : 0) * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];
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
    filter.datasource_ids.length ? { datasource_ids: _.join(filter.datasource_ids, ',') } : {},
    filter.severity !== undefined ? { severity: filter.severity } : {},
    filter.query ? { query: filter.query } : {},
    filter.is_recovered !== undefined ? { is_recovered: filter.is_recovered } : {},
    { bgid: filter.bgid },
    filter.rule_prods.length ? { rule_prods: _.join(filter.rule_prods, ',') } : {},
  );

  const { tableProps } = useAntdTable(
    (params) => {
      return fetchData(params, filterObj);
    },
    {
      refreshDeps: [refreshFlag, JSON.stringify(filterObj)],
      defaultPageSize: 30,
      debounceWait: 500,
    },
  );

  return (
    <>
      {showHeader && (
        <div className='table-operate-box'>
          <Space wrap>
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
              className='search-input'
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
          </Space>
        </div>
      )}
      <Table
        className='mt-4 n9e-antd-table-with-border-collapse'
        size='small'
        tableLayout='auto'
        scroll={!_.isEmpty(tableProps.dataSource) ? { x: 'max-content' } : undefined}
        columns={columns}
        {...tableProps}
        rowClassName={(record: { severity: number; is_recovered: number }) => {
          return SeverityColor[record.is_recovered ? 3 : record.severity - 1] + '-left-border';
        }}
        pagination={{
          ...pagination,
          ...tableProps.pagination,
          pageSizeOptions: ['30', '100', '200', '500'],
        }}
      />
      <EventDetailDrawer
        showDeleteBtn={false}
        visible={eventDetailDrawerData.visible}
        data={eventDetailDrawerData.data}
        onClose={() => setEventDetailDrawerData({ visible: false })}
        onDeleteSuccess={() => {
          setRefreshFlag(_.uniqueId('refresh_'));
        }}
      />
    </>
  );
};

export default Event;
