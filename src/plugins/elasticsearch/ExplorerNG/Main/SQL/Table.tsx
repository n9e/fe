import React from 'react';
import { Empty } from 'antd';

interface Props {
  tableSelector?: {
    antd: string;
    rgd: string;
  };
  setExecuteLoading?: (loading: boolean) => void;
  executeQuery?: () => void;
  sqlVizType?: string;
}

export default function Table(props: Props) {
  return (
    <div className='flex items-center justify-center h-full'>
      <Empty description='SQL 表格查询功能开发中' />
    </div>
  );
}
