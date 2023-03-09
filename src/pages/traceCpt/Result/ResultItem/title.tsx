import * as React from 'react';
import { Space } from 'antd';
import { formatDuration } from '../../utils/date';

type Props = {
  traceName: string;
  traceID: string;
  duration: number;
  durationPercent: number;
};
export default function ResultItemTitle(props: Props) {
  const { traceName, duration, traceID, durationPercent } = props;

  return (
    <div className='tracing-search-result-item-title'>
      <span className='duration-bar' style={{ width: `${durationPercent || 0}%` }}></span>
      <Space style={{ zIndex: 1, marginLeft: 16 }}>
        <span className='label'>{traceName}</span>
        <span>{traceID}</span>
      </Space>
      <span className='duration'>{formatDuration(duration)}</span>
    </div>
  );
}
