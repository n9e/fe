import React from 'react';
import { Line } from '@ant-design/charts';
import 'antd/dist/antd.css'; // 引入 Ant Design 的样式

interface DataPoint {
  time: string;
  value: number;
}

export default function LineChart() {
  const data: DataPoint[] = [
    { time: '00:00', value: 10 },
    { time: '01:00', value: 20 },
    { time: '02:00', value: 15 },
    { time: '03:00', value: 35 },
    { time: '04:00', value: 60 },
    { time: '05:00', value: 45 },
    { time: '06:00', value: 64 },
    { time: '07:00', value: 54 },
    { time: '08:00', value: 55 },
    { time: '09:00', value: 37 },
    { time: '10:00', value: 56 },
    { time: '11:00', value: 42 },
    { time: '12:00', value: 35 },
    // 更多数据...
  ];

  const config = {
    data,
    height: 200,
    smooth: true,
    xField: 'time',
    yField: 'value',
    point: {
      size: 5,
      shape: 'cicle',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  return (
    <div>
      <h4 style={{ textAlign: 'center' }}>健康度趋势图</h4>
      <Line {...config} />
    </div>
  );
};


