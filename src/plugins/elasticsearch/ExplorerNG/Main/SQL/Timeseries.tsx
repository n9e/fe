import React from 'react';
import { Empty } from 'antd';

interface Props {
  width?: number;
  setExecuteLoading?: (loading: boolean) => void;
  sqlVizType?: string;
  timeseriesKeys?: {
    value: string[];
    label: string[];
  };
}

export default function Timeseries(props: Props) {
  return (
    <div className='flex items-center justify-center h-full'>
      <Empty description='SQL 时序查询功能开发中' />
    </div>
  );
}
