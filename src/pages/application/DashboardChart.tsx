
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
    name: string; 
    health: number; //纵坐标
  };
}

const Chart: React.FC<ChartProps> = ({ data }) => {
 
  const option = {
    // grid: {
    //     top: '20%', // 调整顶部间距，使得标题能够显示在图的正下方
    //     left: 'center', // 居中显示
    //     right: 'center', // 居中显示
    //     containLabel: true // 将标签和图表区域包含在内，确保标题可以紧贴图表
    // },
    title:[//标题组件，数组里的一个对象表示一个标题
            {text:data.name,
            left:'center',
            top: '80%',
            textStyle:{
              fontSize: 14, // 标题字体大小设置为20
              color: "black" // 标题字体颜色设置为黑色
            }}
        ],
        series: [//系列
        {
            name: data.name,
            type: 'pie',//pie类型的图实现环形图
            radius: ['32%','58%'],//数组的话，表示内圆和外圆的半径大小，相对于宽高中较小的那一个。
            center:['50%','50%'],//圆心坐标
            avoidLabelOverlap: false,//是否启用防止标签重叠策略
            startAngle:270,//第一个数据开始绘制的角度，以正交直角坐标系为标准
            label: {//每个数据的标签
                show: true,//设置为true则显示第一个数据
                position: 'center',//位置居中
                formatter:'{d}',//{d}表示数据在总数据中的百分比
                fontSize:15,
                //fontWeight:'bold'
            },
            color: [data.health < 60 ? '#ff4d4f' : data.health < 80 ? 'yellow' : '#52c41a', '#d7dbde'],//系列的颜色
            emphasis: {//高亮，即鼠标经过时的样式
                scale:false//表示不放大item
            },
            labelLine: {
                show: true
            },
            data: [
                {value: data.health, name: ''},
                {value:100-data.health, name:'',
                emphasis:{
                    label:{
                        show:false//这个数据高亮时不显示label，就不会显示替遮住第一个数据的label值了
                    }
                }}
            ]
        }
    ]  
  };
      
  return <ReactECharts option={option}  style={{ height: '100%', width: '100%' }}/>;
};

export default Chart;
