import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useAntdTable } from 'ahooks';
import { Table, Space, Tag, Select, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { CommonStateContext } from '@/App';
import { IS_ENT } from '@/utils/constant';
import RefreshIcon from '@/components/RefreshIcon';
import TimeRangePicker, { parseRange, getDefaultValue, IRawTimeRange } from '@/components/TimeRangePicker';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import { SeverityColor } from '@/pages/event';
import { getEvents } from '@/pages/historyEvents/services';

import { CN } from '../../../../constants';

interface Props {
  selectedEventIds?: number[];
  setSelectedEventIds: (ids: number[]) => void;
}

const CACHE_KEY = 'alert_events_range';

export default function Events(props: Props) {
  const { selectedEventIds, setSelectedEventIds } = props;
  const { t } = useTranslation('AlertHisEvents');
  const { feats, datasourceList } = useContext(CommonStateContext);
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [filter, setFilter] = useState<{
    range: IRawTimeRange;
    datasource_ids?: number[];
    severity?: number;
    query?: string;
    is_recovered?: number;
    bgid?: number;
    rule_prods?: string[];
  }>({
    range: getDefaultValue(CACHE_KEY, {
      start: 'now-6h',
      end: 'now',
    }),
  });
  const columns = [
    {
      title: t('prod'),
      dataIndex: 'rule_prod',
      width: 100,
      render: (value) => {
        return t(`rule_prod.${value}`);
      },
    },
    {
      title: t('common:datasource.id'),
      dataIndex: 'datasource_id',
      width: 100,
      render: (value, record) => {
        return _.find(datasourceList, { id: value })?.name || '-';
      },
    },
    {
      title: t('rule_name'),
      dataIndex: 'rule_name',
      render(title, { id, tags }) {
        const content =
          tags &&
          tags.map((item) => (
            <Tag
              key={item}
              onClick={(e) => {
                if (!_.includes(filter.query, item)) {
                  setFilter({
                    ...filter,
                    query: filter.query ? `${filter.query.trim()} ${item}` : item,
                  });
                }
              }}
            >
              {item}
            </Tag>
          ));
        return (
          <>
            <div className='mb1'>
              <Link
                to={{
                  pathname: `/alert-his-events/${id}`,
                }}
                target='_blank'
              >
                {title}
              </Link>
            </div>
            <div>
              <span
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  rowGap: 4,
                }}
              >
                {content}
              </span>
            </div>
          </>
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

  const fetchData = ({ current, pageSize }) => {
    const parsedRange = parseRange(filter.range);
    return getEvents({
      p: current,
      limit: pageSize,
      ..._.omit(filter, 'range'),
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
    refreshDeps: [refreshFlag, JSON.stringify(filter)],
    defaultPageSize: 30,
    debounceWait: 500,
  });
  return (
    <div className={`${CN}-preview-events`}>
      <div className='mb1'>
        <Space>
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
        </Space>
      </div>
      <Table
        className='mt8'
        size='small'
        rowKey={(record) => record.id}
        columns={columns}
        {...tableProps}
        rowClassName={(record: { severity: number; is_recovered: number }) => {
          return SeverityColor[record.is_recovered ? 3 : record.severity - 1] + '-left-border';
        }}
        pagination={{
          ...tableProps.pagination,
          pageSizeOptions: ['30', '100', '200', '500'],
        }}
        rowSelection={{
          selectedRowKeys: selectedEventIds,
          onChange: (selectedRowKeys: number[]) => {
            setSelectedEventIds(selectedRowKeys);
          },
        }}
        scroll={{ y: 400 }}
      />
    </div>
  );
}
