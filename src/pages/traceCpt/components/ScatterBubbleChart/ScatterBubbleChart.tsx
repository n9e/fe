import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scatter, ScatterConfig } from '@ant-design/plots';
import _ from 'lodash';
import moment from 'moment';
import { formatDuration } from '../../utils/date';
import { Trace } from '../../type';

interface Props {
  data: Trace[];
  elClick?: (value: Trace) => void; // 点击事件
}

const ScatterBulleChart = (props: Props) => {
  const { t } = useTranslation('trace');
  const { data, elClick } = props;
  const tooltipNameMap = {
    startTime: t('chart.start_time'),
    duration: t('chart.duration'),
    spansLengh: t('chart.span_count'),
  };
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
        text: t('chart.duration_axis'),
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
        text: t('chart.time_axis'),
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
          const key = el.name;
          // @ts-ignore
          el.name = tooltipNameMap[key] ?? el.name;
          if (key === 'startTime') {
            // @ts-ignore
            el.value = moment(el.value / 1e6).format('hh:mm:ss');
          }
          if (key === 'duration') {
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
