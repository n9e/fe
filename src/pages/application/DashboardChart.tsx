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
const value = 80
const name = 'OA系统';
const color = '#00E5F1';
const Chart: React.FC<ChartProps> = (data) => {
  const option = {
    //颜色
    color: ['#6C92F4', '#d7dbde'],
    title:{
        show:true,
        text:value,
        x:'center',
        y:'center',
        textStyle: {
            fontSize: '15',
            color:'black',
            fontWeight: 'normal'
        }
    },
    //提示框
    tooltip: {
        trigger: 'item',
        formatter: "{d}%",
        show:false
    },
    legend: {
        orient: 'vertical',
        x: 'left',
        show:false
    },
    series:
        {
            name:'OA',
            type:'pie',
            //圆环的大小
            radius: ['65%', '85%'],
            // 是否启用防止标签重叠策略
            avoidLabelOverlap: true,
            //点击进度条时放大效果
            hoverAnimation:false,
            label: {
                normal: {
                    show: false,
                    position: 'left'
                },
                emphasis: {
                    show: false
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data:[
                {value:value, name:''},
                {value:100-value, name:''}
            ]
        
                

        },

  };
      
  return <ReactECharts option={option} style={{ height: '400px' }} />;
};

export default Chart;
