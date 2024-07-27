// src/components/Chart.tsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
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
  PieChart,
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
    // title: {
    //   text: '应用统计',
    //   left: 'center', // 设置标题居中
    //   textStyle: {
    //     fontSize: 18,
    //     fontWeight: 'bold',
    //   },
    // },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: data.labels,
    },
    series: [
      {
        name: '应用系统',
        type: 'pie',
        radius: ['55%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '30',
            //fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.values.map((value, index) => ({
          value,
          name: data.labels[index],
          itemStyle: {
            color: index === 0 ? '#52c41a' : index === 1 ? 'yellow' : '#ff4d4f', // 分别设置为绿色、黄色、红色
          },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '100%' }} />;
};

export default Chart;
