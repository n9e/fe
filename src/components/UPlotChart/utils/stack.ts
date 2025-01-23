import _ from 'lodash';

export function seriesBuider(data: any[]) {
  return _.map(_.slice(data, 1), (item) => {
    return {
      scaleKey: '',
      values: item,
      negY: false,
      stacking: {
        mode: 'normal',
        group: 'A',
      },
    };
  });
}

export default function getStackedDataAndBands(dat: any) {
  const series = seriesBuider(dat);
  // for uplot data
  let data = Array(series.length);
  let bands: any[] = [];

  let dataLen = series[0].values.length;

  let zeroArr = Array(dataLen).fill(0);

  let stackGroups = new Map();
  let seriesStackKeys = Array(series.length);

  series.forEach((s, si) => {
    let vals = s.values.slice();

    // apply negY
    if (s.negY) {
      for (let i = 0; i < vals.length; i++) {
        if (vals[i] != null) vals[i] *= -1;
      }
    }

    if (s.stacking.mode != 'none') {
      let hasPos = vals.some((v) => v > 0);
      // derive stacking key
      let stackKey = (seriesStackKeys[si] = s.stacking.mode + s.scaleKey + s.stacking.group + (hasPos ? '+' : '-'));
      let group = stackGroups.get(stackKey);

      // initialize stacking group
      if (group == null) {
        group = {
          series: [],
          acc: zeroArr.slice(),
          dir: hasPos ? -1 : 1,
        };
        stackGroups.set(stackKey, group);
      }

      // push for bands gen
      group.series.unshift(si);

      let stacked = (data[si] = Array(dataLen));
      let { acc } = group;

      for (let i = 0; i < dataLen; i++) {
        let v = vals[i];

        if (v != null) stacked[i] = acc[i] += v;
        else stacked[i] = acc[i]; // 如果值为null，直接作为0处理
      }
    } else data[si] = vals;
  });

  // re-compute by percent
  series.forEach((s, si) => {
    if (s.stacking.mode == 'percent') {
      let group = stackGroups.get(seriesStackKeys[si]);
      let { acc } = group;

      // re-negatify percent
      let sign = group.dir * -1;

      let stacked = data[si];

      for (let i = 0; i < dataLen; i++) {
        let v = stacked[i];

        if (v != null) stacked[i] = sign * (v / acc[i]);
      }
    }
  });

  // generate bands between adjacent group series
  stackGroups.forEach((group) => {
    let { series, dir } = group;
    let lastIdx = series.length - 1;

    series.forEach((si, i) => {
      if (i != lastIdx) {
        let nextIdx = series[i + 1];
        bands.push({
          // since we're not passing x series[0] for stacking, real idxs are actually +1
          series: [si + 1, nextIdx + 1],
          dir,
        });
      }
    });
  });

  return {
    data,
    bands,
  };
}
