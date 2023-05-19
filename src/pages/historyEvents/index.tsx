/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useContext, useState } from 'react';
import { AlertOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import _ from 'lodash';
import { useAntdTable } from 'ahooks';
import { Input, Tag, Button, Space, Table, Select, message } from 'antd';
import { Link } from 'react-router-dom';
import AdvancedWrap from '@/components/AdvancedWrap';
import PageLayout from '@/components/pageLayout';
import RefreshIcon from '@/components/RefreshIcon';
import { hoursOptions } from '@/pages/event/constants';
import { CommonStateContext } from '@/App';
import exportEvents, { downloadFile } from './exportEvents';
import { getEvents } from './services';
import { SeverityColor } from '../event';
import '../event/index.less';
import './locale';

const Event: React.FC = () => {
  const { t } = useTranslation('AlertHisEvents');
  const { groupedDatasourceList, busiGroups, datasourceList } = useContext(CommonStateContext);
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [filter, setFilter] = useState<{
    hours: number;
    datasourceIds: number[];
    bgid?: number;
    severity?: number;
    eventType?: number;
    queryContent: string;
    rule_prods: string[];
  }>({
    hours: 6,
    datasourceIds: [],
    queryContent: '',
    rule_prods: [],
  });
  const columns = [
    {
      title: t('common:datasource.type'),
      dataIndex: 'cate',
      width: 100,
    },
    {
      title: t('common:datasource.id'),
      dataIndex: 'datasource_id',
      width: 100,
      render: (value, record) => {
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
            <Tag
              color='purple'
              key={item}
              onClick={(e) => {
                if (!filter.queryContent.includes(item)) {
                  setFilter({
                    ...filter,
                    queryContent: filter.queryContent ? `${filter.queryContent.trim()} ${item}` : item,
                  });
                }
              }}
            >
              {item}
            </Tag>
          ));
        return (
          <>
            <div>
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
              <span className='event-tags'>{content}</span>
            </div>
          </>
        );
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
  const filterObj = Object.assign(
    { hours: filter.hours },
    filter.datasourceIds.length ? { datasource_ids: _.join(filter.datasourceIds, ',') } : {},
    filter.severity !== undefined ? { severity: filter.severity } : {},
    filter.queryContent ? { query: filter.queryContent } : {},
    filter.eventType !== undefined ? { is_recovered: filter.eventType } : {},
    { bgid: filter.bgid },
    filter.rule_prods.length ? { rule_prods: _.join(filter.rule_prods, ',') } : {},
  );

  function renderLeftHeader() {
    return (
      <div className='table-operate-box'>
        <Space>
          <RefreshIcon
            onClick={() => {
              setRefreshFlag(_.uniqueId('refresh_'));
            }}
          />
          <Select
            style={{ minWidth: 80 }}
            value={filter.hours}
            onChange={(val) => {
              setFilter({
                ...filter,
                hours: val,
              });
            }}
          >
            {hoursOptions.map((item) => {
              return <Select.Option value={item.value}>{t(`hours.${item.value}`)}</Select.Option>;
            })}
          </Select>
          <AdvancedWrap var='VITE_IS_ALERT_AI,VITE_IS_ALERT_ES,VITE_IS_SLS_DS'>
            {(isShow) => {
              let options = [
                {
                  label: 'Metric',
                  value: 'metric',
                },
                {
                  label: 'Host',
                  value: 'host',
                },
              ];
              if (isShow[0]) {
                options = [
                  ...options,
                  {
                    label: 'Anomaly',
                    value: 'anomaly',
                  },
                ];
              }
              if (isShow[1] || isShow[2]) {
                options = [
                  ...options,
                  {
                    label: 'Log',
                    value: 'logging',
                  },
                ];
              }
              return (
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
                  {options.map((item) => {
                    return (
                      <Select.Option value={item.value} key={item.value}>
                        {item.label}
                      </Select.Option>
                    );
                  })}
                </Select>
              );
            }}
          </AdvancedWrap>
          <Select
            allowClear
            mode='multiple'
            placeholder={t('common:datasource.id')}
            style={{ minWidth: 100 }}
            maxTagCount='responsive'
            dropdownMatchSelectWidth={false}
            value={filter.datasourceIds}
            onChange={(val) => {
              setFilter({
                ...filter,
                datasourceIds: val,
              });
            }}
          >
            {_.map(datasourceList, (item) => (
              <Select.Option value={item.id} key={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            style={{ minWidth: 120 }}
            placeholder={t('common:business_group')}
            allowClear
            value={filter.bgid}
            onChange={(val) => {
              setFilter({
                ...filter,
                bgid: val,
              });
            }}
          >
            {_.map(busiGroups, (item) => {
              return <Select.Option value={item.id}>{item.name}</Select.Option>;
            })}
          </Select>
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
              setRefreshFlag(_.uniqueId('refresh_'));
            }}
          />
          <Button
            loading={exportBtnLoadding}
            onClick={() => {
              setExportBtnLoadding(true);
              exportEvents({ ...filterObj, limit: 1000000, p: 1 }, (err, csv) => {
                if (err) {
                  message.error(t('export_failed'));
                } else {
                  downloadFile(csv, `events_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
                }
                setExportBtnLoadding(false);
              });
            }}
          >
            {t('export')}
          </Button>
        </Space>
      </div>
    );
  }

  const fetchData = ({ current, pageSize }) => {
    return getEvents({
      p: current,
      limit: pageSize,
      ...filterObj,
    }).then((res) => {
      return {
        total: res.dat.total,
        list: res.dat.list,
      };
    });
  };

  const { tableProps } = useAntdTable(fetchData, {
    refreshDeps: [refreshFlag, JSON.stringify(filterObj)],
    defaultPageSize: 30,
  });

  return (
    <PageLayout icon={<AlertOutlined />} title={t('title')}>
      <div className='event-content'>
        <div className='table-area'>
          {renderLeftHeader()}
          <Table
            size='small'
            columns={columns}
            {...tableProps}
            rowClassName={(record: { severity: number; is_recovered: number }) => {
              return SeverityColor[record.is_recovered ? 3 : record.severity - 1] + '-left-border';
            }}
            pagination={{
              ...tableProps.pagination,
              pageSizeOptions: ['30', '100', '200', '500'],
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default Event;
