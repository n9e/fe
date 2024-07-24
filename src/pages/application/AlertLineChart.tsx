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
    x: string[]; //横坐标
    y: number[]; //纵坐标
  };
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  const option = {
    title: {
      text: '告警趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: data.x,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: data.y,
        type: 'line',
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '400px' }} />;
};

export default Chart;
