import React, { useState, useEffect } from 'react';
import { getEventTSQuery } from '@/services/warning';
import moment from 'moment';
import _ from 'lodash';
import { parseRange } from '@/components/TimeRangePicker';
import Graph from './Graph';

const getSerieName = (metric: Object) => {
  let name = metric['__name__'] || '';
  _.forEach(_.omit(metric, '__name__'), (value, key) => {
    name += ` ${key}: ${value}`;
  });
  return _.trim(name);
};

export default function ElasticsearchGraph({ eventId, range, triggerTime, onClick }) {
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    const parsedRange = parseRange(range);
    const start = moment(parsedRange.start).unix();
    const end = moment(parsedRange.end).unix();
    getEventTSQuery({
      event_id: eventId,
      start,
      end,
    }).then((res) => {
      const newSeries = _.map(res.dat, (item) => {
        return {
          id: _.uniqueId('series_'),
          name: getSerieName(item.metric),
          metric: item.metric,
          data: item.values,
        };
      });
      setSeries(newSeries);
    });
  }, [eventId, JSON.stringify(range)]);
  return (
    <div>
      <Graph series={series} xThresholds={[triggerTime]} onClick={onClick} />
    </div>
  );
}
