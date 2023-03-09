import React, { useState, useEffect } from 'react';
import { Scatter, ScatterConfig } from '@ant-design/plots';
import _ from 'lodash';
import moment from 'moment';
import { formatDuration } from '../../utils/date';
import { Trace } from '../../type';

interface Props {
  data: Trace[];
  elClick?: (value: Trace) => void; // 点击事件
}

const tooltipNameMap = {
  startTime: '发生时间',
  duration: '持续时间',
  spansLengh: '数量',
};

const ScatterBulleChart = (props: Props) => {
  const { data, elClick } = props;
  const [scatterData, setScatterData] = useState<Trace[]>([]);

  useEffect(() => {
    init();
  }, [data]);

  const init = () => {
    if (data?.length > 0) {
      data.forEach((el) => {
        el.spansLengh = el.spans?.length || el.spansLengh;
      });
      setScatterData(data);
    }
  };

  const config: ScatterConfig = {
    appendPadding: 30,
    data: scatterData,
    xField: 'startTime',
    yField: 'duration',
    color: 'r(0.4, 0.3, 0.7) 0:rgba(255,255,255,0.5) 1:#6C53B1',
    sizeField: 'spansLengh',
    size: [5, 10],
    shape: 'circle',
    interactions: [
      {
        type: 'element-selected',
        cfg: {
          start: [{ trigger: 'element:mouseenter', action: 'cursor:pointer' }],
          end: [{ trigger: 'element:mouseleave', action: 'cursor:default' }],
        },
      },
    ],

    yAxis: {
      max: 3,
      tickCount: 4,
      title: {
        text: '耗时',
        position: 'end',
        autoRotate: false,
        offset: -20,
      },
      nice: true,
      line: {
        style: {
          stroke: '#eee',
        },
      },
      grid: null,
      label: {
        formatter: (text: string, item, index: number) => {
          let num = parseInt(text);
          return num === 0 ? text : formatDuration(num);
        },
      },
    },
    xAxis: {
      title: {
        text: '时间',
        position: 'end',
        offset: -10,
      },
      nice: true,
      line: {
        style: {
          stroke: '#eee',
        },
      },
      label: {
        formatter: (text: string, item, index: number) => {
          let result = moment(parseInt(text) / 1e6).format('hh:mm:ss');
          return text === '0' ? '00:00:00' : result;
        },
      },
    },

    tooltip: {
      title: '123',
      domStyles: {
        'g2-tooltip-marker': {},
      },
      customItems: (originalItems) => {
        let result = _.cloneDeep(originalItems);
        result.forEach((el) => {
          // @ts-ignore
          el.name = tooltipNameMap[el.name];
          if (el.name === '发生时间') {
            // @ts-ignore
            el.value = moment(el.value / 1e6).format('hh:mm:ss');
          }
          if (el.name == '持续时间') {
            // @ts-ignore
            el.value = formatDuration(el.value);
          }
        });

        return result;
      },
    },
    brush: {
      enabled: true,
    },
  };

  return (
    <Scatter
      {...config}
      onReady={(plot) => {
        plot.on('element:click', (evt) => {
          elClick && elClick(evt.data.data);
        });
      }}
    />
  );
};

export default ScatterBulleChart;
