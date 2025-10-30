import React, { useContext, useEffect, useRef } from 'react';
import TsGraph from '@fc-plot/ts-graph';
import '@fc-plot/ts-graph/dist/index.css';
import moment from 'moment';
import _ from 'lodash';

import { PRIMARY_COLOR } from '@/utils/constant';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';

interface Props {
  time: IRawTimeRange;
  series: any[];
  onClick?: (event: any, datetime: Date, value: number, points: any[]) => void;
  onZoomWithoutDefult?: (times: Date[]) => void;
}

export default function HistogramChart(props: Props) {
  const { darkMode } = useContext(CommonStateContext);
  const { time, series, onClick, onZoomWithoutDefult } = props;
  const chartEleRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<TsGraph>(null);

  useEffect(() => {
    if (chartEleRef.current) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      chartRef.current = new TsGraph({
        timestamp: 'X',
        xkey: 0,
        ykey: 1,
        ykey2: 2,
        ykeyFormatter: (value) => Number(value),
        chart: {
          renderTo: chartEleRef.current,
          height: chartEleRef.current.clientHeight,
          colors: [PRIMARY_COLOR],
          marginTop: 0,
        },
        series: [],
        hideResetBtn: true,
        onClick: (event, datetime, value, points) => {
          if (onClick) onClick(event, datetime, value, points);
        },
      });
    }
    return () => {
      if (chartRef.current && typeof chartRef.current.destroy === 'function') {
        chartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    let xAxisDamin = {};
    if (time) {
      const parsedRange = parseRange(time);
      const start = moment(parsedRange.start).unix();
      const end = moment(parsedRange.end).unix();
      xAxisDamin = { min: start, max: end };
    }
    if (chartRef.current) {
      chartRef.current.update({
        type: 'bar',
        series: _.cloneDeep(series),
        area: {
          ...chartRef.current.options.area,
          opacity: 1,
        },
        tooltip: {
          ...chartRef.current.options.tooltip,
          shared: true,
        },
        xAxis: {
          ...chartRef.current.options.xAxis,
          ...xAxisDamin,
          lineColor: darkMode ? 'rgba(255,255,255,0.2)' : '#ccc',
          tickColor: darkMode ? 'rgba(255,255,255,0.2)' : '#ccc',
        },
        yAxis: {
          ...chartRef.current.options.yAxis,
          backgroundColor: darkMode ? 'rgb(24,27,31)' : '#fff',
          gridLineColor: darkMode ? 'rgba(255,255,255,0.05)' : '#efefef',
        },
        onClick: (event, datetime, value, points) => {
          if (onClick) onClick(event, datetime, value, points);
        },
        hideResetBtn: true,
        onZoomWithoutDefult,
      });
    }
  }, [JSON.stringify(series), darkMode]);

  return <div ref={chartEleRef} className='w-full min-w-0 h-full min-h-0' />;
}
