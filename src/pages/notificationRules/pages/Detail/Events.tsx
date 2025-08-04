import React, { useState } from 'react';
import _ from 'lodash';
import moment from 'moment';

import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import ListNG from '@/pages/historyEvents/ListNG';

import { getNotifyEvents } from '../../services';

interface Props {
  id: number;
  days: number;
}

export default function Events(props: Props) {
  const { id, days } = props;
  const [filter, setFilter] = useState({
    range: {
      start: `now-${days}d`,
      end: 'now',
    } as IRawTimeRange,
    datasource_ids: [],
    rule_prods: [],
  });

  return (
    <ListNG
      filter={filter}
      setFilter={setFilter}
      fetchData={({ current, pageSize }, filterObj) => {
        const parsedRange = parseRange(filterObj.range);
        return getNotifyEvents(id, {
          p: current,
          limit: pageSize,
          ..._.omit(filterObj, 'range'),
          stime: moment(parsedRange.start).unix(),
          etime: moment(parsedRange.end).unix(),
        }).then((dat) => {
          return {
            total: dat.total,
            list: dat.list,
          };
        });
      }}
    />
  );
}
