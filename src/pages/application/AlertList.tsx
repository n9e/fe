import { Table } from "antd";
import React from "react";

// Define interface for our data item
interface DataItem {
    key?: string;
    alertTime: string;
    alertType: string;
    alertStatus: string;
  }
  
  // Dummy data
const dataSource: DataItem[] = [
    {      
      alertTime: '2024-3-1',
      alertType: '丢包',
      alertStatus: '待处置',
    },
    {      
        alertTime: '2024-3-1',
        alertType: '丢包',
        alertStatus: '待处置',
      },
      {      
        alertTime: '2024-3-1',
        alertType: '丢包',
        alertStatus: '待处置',
      },
  ];
  // Define columns for the table
const columns = [
    {
      title: '告警时间',
      dataIndex: 'alertTime',
      key: 'alertTime',
    },
    {
      title: '类型',
      dataIndex: 'alertType',
      key: 'alertType',
    },{
      title: 'IP',
      dataIndex: 'alertIp',
      key: 'alertIp',
    },
    {
      title: '状态',
      dataIndex: 'alertStatus',
      key: 'alertStatus',
    },
  ];

export default function AlertList(){
    return(
        <><h4 style={{textAlign:'center'}}>应用系统告警信息</h4>
        <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false} // Disable pagination for simplicity
        /></>
    );
}







