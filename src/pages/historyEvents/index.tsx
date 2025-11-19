import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Space } from 'antd';
import { AlertOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import PageLayout, { HelpLink } from '@/components/pageLayout';
import { parseRange, getDefaultValue, isMathString, IRawTimeRange } from '@/components/TimeRangePicker';

import { getEvents, getEventsByIds } from './services';
import '../event/index.less';
import './locale';

import ListNG, { CACHE_KEY } from './ListNG';

const getFilter = (query) => {
  let defaultRange: IRawTimeRange | undefined = undefined;
  if (query.start && query.end) {
    if (isMathString(query.start) && isMathString(query.end)) {
      defaultRange = { start: query.start, end: query.end };
    } else if (!_.isNaN(_.toNumber(query.start)) && !_.isNaN(_.toNumber(query.end))) {
      const startMoment = moment.unix(query.start);
      const endMoment = moment.unix(query.end);
      if (startMoment.isValid() && endMoment.isValid()) {
        defaultRange = { start: startMoment, end: endMoment };
      }
    }
  }
  return {
    range: defaultRange ?? getDefaultValue(CACHE_KEY, { start: 'now-6h', end: 'now' }),
    datasource_ids: query.datasource_ids ? _.split(query.datasource_ids, ',').map(Number) : [],
    bgid: query.bgid ? Number(query.bgid) : undefined,
    severity: query.severity ? Number(query.severity) : undefined,
    query: query.query,
    is_recovered: query.is_recovered ? Number(query.is_recovered) : undefined,
    rule_prods: query.rule_prods ? _.split(query.rule_prods, ',') : [],
  };
};

export default function List() {
  const { t } = useTranslation('AlertHisEvents');
  const location = useLocation();
  const query = queryString.parse(location.search);
  const history = useHistory();
  const filter = getFilter(query);
  const setFilter = (newFilter) => {
    const range = newFilter.range;
    let currentRange: IRawTimeRange = {} as IRawTimeRange;
    if (range?.start && range?.end) {
      if (isMathString(range.start) && isMathString(range.end)) {
        currentRange = range;
      }
      if (moment.isMoment(range.start) && moment.isMoment(range.end)) {
        currentRange = {
          start: range.start.unix(),
          end: range.end.unix(),
        };
      }
    }
    history.replace({
      pathname: location.pathname,
      search: queryString.stringify({
        ...query,
        ..._.omit(newFilter, 'range'),
        ...currentRange,
      }),
    });
  };

  return (
    <PageLayout
      icon={<AlertOutlined />}
      title={
        <Space>
          {t('title')}
          <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/alarm-management/historical-alarms/' />
        </Space>
      }
    >
      <div className='event-content'>
        <div className='table-area fc-border'>
          <ListNG
            filter={filter}
            setFilter={setFilter}
            fetchData={({ current, pageSize }, filterObj) => {
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
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
}
