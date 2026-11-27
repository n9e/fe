import { withRefreshScope } from '@/components/TimeRangePicker/RefreshScope';
import React from 'react';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import Detail from './Detail';

interface URLParam {
  id: string;
}

function index() {
  const { id } = useParams<URLParam>();
  // 切换仪表盘是，Detail 组件需要重新加载，不然会出现数据错乱的情况
  return <Detail key={id} />;
}

export default withRefreshScope(index);
