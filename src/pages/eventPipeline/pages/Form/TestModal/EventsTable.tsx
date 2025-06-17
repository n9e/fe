import React, { useState, useContext } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useAntdTable } from 'ahooks';
import { Table, Tag, Space, Select, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { allCates } from '@/components/AdvancedWrap/utils';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
import { getEvents } from '@/pages/historyEvents/services';
import { SEVERITY_COLORS } from '@/pages/alertCurEvent/constants';

interface Props {
  rowSelectionType?: 'checkbox' | 'radio';
  selectedEventIds?: number[];
  onChange?: (ids: number[]) => void;
}

export default function EventsTable(props: Props) {
  const { t } = useTranslation('AlertHisEvents');
  const { datasourceList } = useContext(CommonStateContext);
  const { rowSelectionType = 'checkbox', selectedEventIds, onChange } = props;
  const [filter, setFilter] = useState<{
    range: IRawTimeRange;
    datasourceIds: number[];
    bgid?: number;
    severity?: number;
    eventType?: number;
    queryContent: string;
    rule_prods: string[];
  }>({
    range: {
      start: 'now-6h',
      end: 'now',
    },
    datasourceIds: [],
    queryContent: '',
    rule_prods: [],
  });
  const filterObj = Object.assign(
    { range: filter.range },
    filter.datasourceIds.length ? { datasource_ids: _.join(filter.datasourceIds, ',') } : {},
    filter.severity !== undefined ? { severity: filter.severity } : {},
    filter.queryContent ? { query: filter.queryContent } : {},
    filter.eventType !== undefined ? { is_recovered: filter.eventType } : {},
    { bgid: filter.bgid },
    filter.rule_prods.length ? { rule_prods: _.join(filter.rule_prods, ',') } : {},
  );

  const fetchData = ({ current, pageSize }) => {
    const parsedRange = parseRange(filterObj.range);
    return getEvents({
      p: current,
      limit: pageSize,
      ..._.omit(filterObj, 'range'),
      stime: moment(parsedRange.start).unix(),
      etime: moment(parsedRange.end).unix(),
    }).then((res) => {
      return {
        total: res.dat.total,
        list: res.dat.list,
      };
    });
  };
  const { tableProps } = useAntdTable(fetchData, {
    refreshDeps: [JSON.stringify(filterObj)],
    defaultPageSize: 30,
    debounceWait: 500,
  });

  return (
    <>
      <div>
        <Space>
          <TimeRangePicker
            value={filter.range}
            onChange={(val) => {
              setFilter({
                ...filter,
                range: val,
              });
            }}
            dateFormat='YYYY-MM-DD HH:mm:ss'
          />
          <DatasourceSelect
            style={{ width: 100 }}
            filterKey='alertRule'
            value={filter.datasourceIds}
            onChange={(val: number[]) => {
              setFilter({
                ...filter,
                datasourceIds: val,
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
            value={filter.eventType}
            onChange={(val) => {
              setFilter({
                ...filter,
                eventType: val,
              });
            }}
            dropdownMatchSelectWidth={false}
          >
            <Select.Option value={0}>Triggered</Select.Option>
            <Select.Option value={1}>Recovered</Select.Option>
          </Select>
          <Input
            allowClear
            style={{ width: 400 }}
            prefix={<SearchOutlined />}
            placeholder={t('search_placeholder')}
            value={filter.queryContent}
            onChange={(e) => {
              setFilter({
                ...filter,
                queryContent: e.target.value,
              });
            }}
          />
        </Space>
      </div>
      <Table
        className='mt-2 n9e-antd-table-with-border-collapse'
        rowKey={(record) => record.id}
        size='small'
        columns={[
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
                      {title}
                    </Space>
                  </div>
                  <div>
                    {_.map(record.tags, (item) => {
                      return (
                        <Tag
                          key={item}
                          style={{ maxWidth: '100%' }}
                          onClick={() => {
                            if (!_.includes(filter.queryContent, item)) {
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
        ]}
        {...tableProps}
        pagination={{
          ...tableProps.pagination,
          pageSizeOptions: ['30', '100', '200', '500'],
        }}
        scroll={{ x: 'max-content', y: 400 }}
        rowSelection={{
          type: rowSelectionType,
          selectedRowKeys: selectedEventIds,
          onChange: (selectedRowKeys: number[], selectedRows: any[]) => {
            onChange && onChange(selectedRowKeys);
          },
        }}
        rowClassName={(record: { severity: number; is_recovered: number }) => {
          return SEVERITY_COLORS[record.is_recovered ? 3 : record.severity - 1] + '-left-border';
        }}
      />
    </>
  );
}
