// src/components/Chart.tsx

import React, { useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Smooth } from '@antv/g2/lib/shape/line/smooth';
import { symbol } from 'd3';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
]);

interface ChartProps {
  data: { 
    labels: string[]; 
    values: number[] 
  };
}


const Chart: React.FC<ChartProps> = ({ data }) => {
  const option = {
   
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: data.labels,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: data.values,
        type: 'line',
        smooth: 0.6,
        symbol: 'none',
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '100%' }} />;
};

export default Chart;
