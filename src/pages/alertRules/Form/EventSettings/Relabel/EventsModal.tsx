import React, { useState, useContext } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useAntdTable } from 'ahooks';
import { Link } from 'react-router-dom';
import { Table, Modal, Tag, Space, Select, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
import { getEvents } from '@/pages/historyEvents/services';

interface Props {
  onOk: (tags: string[]) => void;
}

export default function EventsModal(props: Props) {
  const { t } = useTranslation('AlertHisEvents');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const [visible, setVisible] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
    if (visible) {
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
    }
    return Promise.resolve({
      total: 0,
      list: [],
    });
  };
  const { tableProps } = useAntdTable(fetchData, {
    refreshDeps: [visible, JSON.stringify(filterObj)],
    defaultPageSize: 30,
    debounceWait: 500,
  });

  return (
    <>
      <a
        onClick={() => {
          setVisible(true);
        }}
      >
        {t('alertRules:relabel.test.labelFromEvent')}
      </a>
      <Modal
        width={800}
        title={t('title')}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          props.onOk(selectedTags);
          setVisible(false);
        }}
      >
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
            >
              <Select.Option value={1}>S1</Select.Option>
              <Select.Option value={2}>S2</Select.Option>
              <Select.Option value={3}>S3</Select.Option>
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
            >
              <Select.Option value={0}>Triggered</Select.Option>
              <Select.Option value={1}>Recovered</Select.Option>
            </Select>
            <Input
              className='search-input'
              prefix={<SearchOutlined />}
              placeholder={t('search_placeholder')}
              value={filter.queryContent}
              onChange={(e) => {
                setFilter({
                  ...filter,
                  queryContent: e.target.value,
                });
              }}
              onPressEnter={(e) => {
                // setRefreshFlag(_.uniqueId('refresh_'));
              }}
            />
          </Space>
        </div>
        <Table
          rowKey={(record) => record.id}
          className='mt8'
          size='small'
          columns={[
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
              render: (value, record: any) => {
                return _.find(groupedDatasourceList?.[record.cate], { id: value })?.name || '-';
              },
            },
            {
              title: t('rule_name'),
              dataIndex: 'rule_name',
              render(title, { id, tags }) {
                const content =
                  tags &&
                  tags.map((item) => (
                    <Tag color='purple' key={item}>
                      {item}
                    </Tag>
                  ));
                return (
                  <>
                    <div>{title}</div>
                    <div>
                      <span className='event-tags'>{content}</span>
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
              title: t('trigger_time'),
              dataIndex: 'trigger_time',
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
            type: 'radio',
            onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
              setSelectedTags(selectedRows[0]?.tags || []);
            },
          }}
        />
      </Modal>
    </>
  );
}
