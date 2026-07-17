import React, { useState } from 'react';
import { Card, message, Space, Button } from 'antd';
import TimeSeriesBarChart, { TimeSeriesDataPoint } from '@/components/TimeSeriesBarChart';

const TimeSeriesBarChartExample: React.FC = () => {
  const [dataType, setDataType] = useState<'single' | 'stacked'>('single');

  // 生成单系列示例数据
  const generateSingleData = (): TimeSeriesDataPoint[] => {
    const data: TimeSeriesDataPoint[] = [];
    const startTime = Date.now() - 24 * 60 * 60 * 1000; // 24小时前

    for (let i = 0; i < 24; i++) {
      data.push({
        time: startTime + i * 60 * 60 * 1000,
        value: Math.floor(Math.random() * 100) + 20,
      });
    }

    return data;
  };

  // 生成堆叠图示例数据
  const generateStackedData = (): TimeSeriesDataPoint[] => {
    const data: TimeSeriesDataPoint[] = [];
    const startTime = Date.now() - 24 * 60 * 60 * 1000;
    const categories = ['系列A', '系列B', '系列C'];

    for (let i = 0; i < 24; i++) {
      categories.forEach((category) => {
        data.push({
          time: startTime + i * 60 * 60 * 1000,
          value: Math.floor(Math.random() * 50) + 10,
          category,
        });
      });
    }

    return data;
  };

  const [singleData] = useState(generateSingleData());
  const [stackedData] = useState(generateStackedData());

  // 柱子点击回调
  const handleBarClick = (data: TimeSeriesDataPoint) => {
    const time = new Date(data.time).toLocaleString('zh-CN');
    message.info({
      content: (
        <div>
          <div>点击柱子数据：</div>
          <div>时间: {time}</div>
          <div>值: {data.value}</div>
          {data.category && <div>类别: {data.category}</div>}
        </div>
      ),
      duration: 3,
    });
    console.log('柱子点击数据:', { ...data, timeFormatted: time });
  };

  // 框选回调
  const handleBrushEnd = (timeRange: [number, number]) => {
    const startTime = new Date(timeRange[0]).toLocaleString('zh-CN');
    const endTime = new Date(timeRange[1]).toLocaleString('zh-CN');
    message.success({
      content: (
        <div>
          <div>框选时间范围：</div>
          <div>开始: {startTime}</div>
          <div>结束: {endTime}</div>
        </div>
      ),
      duration: 3,
    });
    console.log('框选时间范围:', { startTime, endTime, range: timeRange });
  };

  return (
    <div className='w-[800px]'>
      <Space direction='vertical' size='large' className='w-full'>
        <Card
          title='时序柱状图示例'
          extra={
            <Space>
              <Button type={dataType === 'single' ? 'primary' : 'default'} onClick={() => setDataType('single')}>
                单系列
              </Button>
              <Button type={dataType === 'stacked' ? 'primary' : 'default'} onClick={() => setDataType('stacked')}>
                堆叠图
              </Button>
            </Space>
          }
        >
          <div className='chart-wrapper'>
            {dataType === 'single' ? (
              <TimeSeriesBarChart data={singleData} height={120} onBarClick={handleBarClick} onBrushEnd={handleBrushEnd} stacked={false} />
            ) : (
              <TimeSeriesBarChart data={stackedData} height={120} onBarClick={handleBarClick} onBrushEnd={handleBrushEnd} stacked={true} />
            )}
          </div>
        </Card>

        <Card title='功能说明'>
          <ul className='feature-list'>
            <li>
              ✅ <strong>点击柱子：</strong>点击任意柱子可以获取该柱子的时间和值数据
            </li>
            <li>
              ✅ <strong>水平框选：</strong>在图表上按住鼠标左键拖动可以框选时间范围
            </li>
            <li>
              ✅ <strong>堆叠图：</strong>切换到堆叠图模式可以看到多系列数据堆叠展示
            </li>
            <li>
              ✅ <strong>图例交互：</strong>点击底部图例可以显示/隐藏对应系列的数据
            </li>
          </ul>
        </Card>

        <Card title='使用示例代码'>
          <pre className='code-block'>
            {`import TimeSeriesBarChart from '@/components/TimeSeriesBarChart';

// 单系列数据
const singleData = [
  { time: 1702656000000, value: 45 },
  { time: 1702659600000, value: 52 },
  // ...
];

// 堆叠图数据
const stackedData = [
  { time: 1702656000000, value: 30, category: '系列A' },
  { time: 1702656000000, value: 20, category: '系列B' },
  { time: 1702659600000, value: 35, category: '系列A' },
  { time: 1702659600000, value: 25, category: '系列B' },
  // ...
];

<TimeSeriesBarChart
  data={stackedData}
  height={400}
  stacked={true}
  onBarClick={(data) => {
    console.log('点击数据:', data);
  }}
  onBrushEnd={(timeRange) => {
    console.log('框选范围:', timeRange);
  }}
  xAxisLabel="时间"
  yAxisLabel="数值"
/>`}
          </pre>
        </Card>
      </Space>
    </div>
  );
};

export default TimeSeriesBarChartExample;
