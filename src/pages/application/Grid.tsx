import React from 'react';
import DashboardChart from './DashboardChart'// 是环形图组件

const Grid = ({ charts }) => {
  // 计算每个网格的样式
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // 三列网格
    gap: '2px',
  };

  return (
    <div style={gridStyle}>
      {charts.map((chart, index) => (
        <div key={index}>
          
          <DashboardChart data={chart} />

        </div>
      ))}
    </div>
  );
};

export default Grid;
