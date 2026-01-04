import React from 'react';
import _ from 'lodash';

import HoneycombChart from '@/components/HoneycombChart';
import calculateHexCoordinates from '@/components/HoneycombChart/utils/calculateHexCoordinates';

import './style.less';

const config = {
  width: 800,
  height: 400,
  spacing: 1.02,
  enableRounded: true, // 是否启用圆角
};

const dataGenerator = () => {
  const count = 100;
  const colors = ['#FFB6C1', '#87CEFA', '#90EE90', '#FFD700', '#FFA500', '#DA70D6'];
  const data: any[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      color: colors[i % colors.length],
      title: `Title Title Title Title Title ${i + 1}`,
      subtitle: `Subtitle Subtitle Subtitle Subtitle Subtitle Subtitle Subtitle ${i + 1}`,
      tooltip: `This is hexagon ${i + 1}`,
    });
  }
  return data;
};

export default function Demo() {
  const data = dataGenerator();
  const coordinates = calculateHexCoordinates(data.length, config.spacing, config.width, config.height);
  const currentData = _.map(data, (item, index) => ({
    ...item,
    ...coordinates.coordinates[index],
  }));

  return (
    <div className='p-2'>
      <div className='w-max border border-antd'>
        <HoneycombChart
          data={currentData}
          hexSize={coordinates.hexSize}
          viewBoxWidth={coordinates.viewBoxWidth}
          viewBoxHeight={coordinates.viewBoxHeight}
          minX={coordinates.minX}
          minY={coordinates.minY}
          options={{
            width: config.width,
            height: config.height,
            spacing: config.spacing,
            enableRounded: config.enableRounded,
          }}
        />
      </div>
    </div>
  );
}
