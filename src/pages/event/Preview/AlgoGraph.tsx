import React, { useState, useEffect } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { parseRange } from '@/components/TimeRangePicker';
import { getBrainData } from '@/services/warning';
import Graph from '../Graph';

const serieColorMap = {
  origin: '#573BA7',
  upper_bound: '#1A94FF',
  lower_bound: '#2ACA96',
  anomaly: 'red',
};
const getUUIDByTags = (tags: string[]) => {
  let uuid = '';
  _.forEach(tags, (tag) => {
    const arr = _.split(tag, 'uuid=');
    if (arr[1]) {
      uuid = arr[1];
    }
  });
  return uuid;
};

export default function AlgoGraph({ rid, tags, range, step }) {
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    const parsedRange = parseRange(range);
    const start = moment(parsedRange.start).unix();
    const end = moment(parsedRange.end).unix();
    let _step = step;
    if (!step) _step = Math.max(Math.floor((end - start) / 240), 1);
    getBrainData({
      rid,
      uuid: getUUIDByTags(tags),
      start,
      end,
      step: _step,
    }).then((res) => {
      const dat = _.map(
        _.filter(res.data, (item) => {
          return item.metric.value_type !== 'predict';
        }),
        (item) => {
          const type = item.metric.value_type;
          return {
            name: `${type}`,
            data: item.values,
            color: serieColorMap[type],
            lineDash: type === 'origin' || type === 'anomaly' ? [] : [4, 4],
          };
        },
      );
      const newSeries: any[] = [];
      const origin = _.cloneDeep(_.find(dat, { name: 'origin' }));
      const lower = _.find(dat, { name: 'lower_bound' });
      const upper = _.find(dat, { name: 'upper_bound' });

      newSeries.push({
        name: 'lower_upper_bound',
        data: _.map(lower?.data, (dataItem, idx) => {
          return [...dataItem, upper?.data[idx][1]];
        }),
        color: '#ccc',
        opacity: 0.5,
      });

      newSeries.push(origin);
      setSeries(newSeries);
    });
  }, [rid, JSON.stringify(tags), JSON.stringify(range), step]);
  return (
    <div>
      <Graph series={series} />
    </div>
  );
}
