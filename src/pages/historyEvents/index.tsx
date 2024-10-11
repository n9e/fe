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
import { Link, useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import PageLayout from '@/components/pageLayout';
import RefreshIcon from '@/components/RefreshIcon';
import { CommonStateContext } from '@/App';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import TimeRangePicker, { parseRange, getDefaultValue } from '@/components/TimeRangePicker';
import { IS_ENT } from '@/utils/constant';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
import exportEvents, { downloadFile } from './exportEvents';
import { getEvents, getEventsByIds } from './services';
import { SeverityColor } from '../event';
import '../event/index.less';
import './locale';

const CACHE_KEY = 'alert_events_range';
const getFilter = (query) => {
  return {
    range: getDefaultValue(CACHE_KEY, {
      start: 'now-6h',
      end: 'now',
    }),
    datasource_ids: query.datasource_ids ? _.split(query.datasource_ids, ',').map(Number) : [],
    bgid: query.bgid ? Number(query.bgid) : undefined,
    severity: query.severity ? Number(query.severity) : undefined,
    query: query.query,
    is_recovered: query.is_recovered ? Number(query.is_recovered) : undefined,
    rule_prods: query.rule_prods ? _.split(query.rule_prods, ',') : [],
  };
};

const Event: React.FC = () => {
  const { t } = useTranslation('AlertHisEvents');
  const location = useLocation();
  const query = queryString.parse(location.search);
  const { feats, datasourceList } = useContext(CommonStateContext);
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const history = useHistory();
  const filter = getFilter(query);
  const setFilter = (newFilter) => {
    history.replace({
      pathname: location.pathname,
      search: queryString.stringify({
        ...query,
        ..._.omit(newFilter, 'range'), // range 仍然通过 loclalStorage 存储
      }),
    });
  };
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
  const [exportBtnLoadding, setExportBtnLoadding] = useState(false);
  const filterObj = Object.assign(
    { range: filter.range },
    filter.datasource_ids.length ? { datasource_ids: _.join(filter.datasource_ids, ',') } : {},
    filter.severity !== undefined ? { severity: filter.severity } : {},
    filter.query ? { query: filter.query } : {},
    filter.is_recovered !== undefined ? { is_recovered: filter.is_recovered } : {},
    { bgid: filter.bgid },
    filter.rule_prods.length ? { rule_prods: _.join(filter.rule_prods, ',') } : {},
  );

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
    if (query.ids && typeof query.ids === 'string') {
      return getEventsByIds(query.ids).then((res) => {
        return {
          total: typeof query.ids === 'string' ? _.split(query.ids, ',').length : 0,
          list: res.dat,
        };
      });
    }
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
    refreshDeps: [refreshFlag, JSON.stringify(filterObj)],
    defaultPageSize: 30,
    debounceWait: 500,
  });

  return (
    <PageLayout icon={<AlertOutlined />} title={t('title')}>
      <div className='event-content'>
        <div className='table-area n9e-border-base'>
          {!query.ids && (
            <div className='table-operate-box'>
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
                >
                  <Select.Option value={1}>S1</Select.Option>
                  <Select.Option value={2}>S2</Select.Option>
                  <Select.Option value={3}>S3</Select.Option>
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
            className='mt8'
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
