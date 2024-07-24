import React from 'react'
import { Card, Row, Col, Statistic } from 'antd';
import { Layout,Table } from 'antd';
import BarChart from './BarChart';
import RoseChart from './RoseChart';
import SortAppBarChart from './SortAppBarChart';
import DashboardChart from './DashboardChart'
import AlertLineChart from './AlertLineChart'
import 'antd/dist/antd.css'; 
import './appDashboard.less'

const { Sider, Content, Footer } = Layout;
const appDashboard: React.FC = () => {
  
  //应用可用性数据
  // 模拟数据
  const appapplicationchartData = {
    x: ['OA系统', 'ITIL系统', '软件工厂', '合同系统', '会议系统'],
    y: [820, 932, 901, 934, 1290],
  };

  //应用统计数据
  const appStatisticData = {
    labels: ['正常', '普通告警', '严重告警' ],
    values: [820, 932, 901],
  };

  const column = [
    {
      
      dataIndex: 'column1',
      key: 'column1',
    },
    {
      
      dataIndex: 'column2',
      key: 'column2',
    },
    {
      
      dataIndex: 'column3',
      key: 'column3',
    },
  ];

  const dataSource = [
    { key: '1', column1: <DashboardChart data={appapplicationchartData}/>, column2:<DashboardChart data={appapplicationchartData}/>, column3: <DashboardChart data={appapplicationchartData}/> },
    { key: '2', column1: '数据2-1', column2: '数据2-2', column3: '数据2-3' },
    { key: '3', column1: '数据3-1', column2: '数据3-2', column3: '数据3-3' },
    // 可以继续添加更多的数据行
  ];

  return (
    <div className="flex-col-container">
      <div className="flex-col-item">
        <div style={{overflow: 'hidden', height: '50%', border: '1px solid #ccc' }}>
          <h4 style={{textAlign: 'center'}}>院级核心应用--健康度</h4>
            <Table dataSource={dataSource} columns={column}/>
          
        </div>
        <div style={{ height: '50%', border: '1px solid #ccc' }}>
          <h4 style={{textAlign: 'center'}}>监控告警趋势</h4>
            <AlertLineChart data={appapplicationchartData}/>
        </div>
      </div>
      <div className="flex-col-item">院级应用列表
        <div style={{ height: '80%' }}>
                   
          <SortAppBarChart data={appapplicationchartData}/>
          
          
        </div>
      </div>
      <div className="flex-col-item">
        <div style={{ height: '50%', border: '1px solid #ccc' }}>
          <h4 style={{textAlign: 'center'}}>应用可用性</h4>          
          <BarChart data={appapplicationchartData}/>
          
        </div>
        <div style={{ height: '50%', border: '1px solid #ccc' }}>
          <h4 style={{textAlign: 'center'}}>应用统计</h4>
          <RoseChart data={appStatisticData}/>
        </div>
      </div>
    </div>
    
  )
}

export default appDashboard
