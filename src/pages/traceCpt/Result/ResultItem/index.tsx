import React from 'react';
import { Divider, Space, Tag } from 'antd';
import { Trace } from '../../type';
import { getTraceName } from '../../utils';
import { getPercentageOfDuration, formatRelativeDate } from '../../utils/date';
import colorGenerator from '../../utils/color-generator';
import moment from 'moment';
import Title from './title';
import '../../index.less';

type Props = {
  trace: Trace;
  maxTraceDuration: number;
  onClick: (v: Trace) => void;
};

export default function ResultItem(props: Props) {
  const { trace, maxTraceDuration, onClick } = props;
  // @ts-ignore
  const traceName = getTraceName(trace.spans, trace.processes);
  const mDate = moment(trace.startTime / 1000);
  const timeStr = mDate.format('h:mm:ss a');
  const fromNow = mDate.fromNow();

  return (
    <div className='tracing-search-result-item' onClick={() => onClick(trace)}>
      <Title traceName={traceName} duration={trace.duration} traceID={trace.traceID} durationPercent={getPercentageOfDuration(trace.duration, maxTraceDuration)} />
      <div className='tracing-search-result-item-content'>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Tag style={{ marginRight: 40 }}>
            {trace.spans.length} {trace.spans.length > 1 ? 'Spans' : 'Span'}
          </Tag>
          <Space wrap={true}>
            {trace.services.map(({ name, numberOfSpans }) => (
              <Tag className='service-tag' style={{ borderLeftColor: colorGenerator.getColorByKey(name) }} key={name}>
                {name} {numberOfSpans}
              </Tag>
            ))}
          </Space>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ marginBottom: 8 }}>
            {formatRelativeDate(trace.startTime / 1000)}
            <Divider type='vertical' />
            {timeStr.slice(0, -3)}
            {timeStr.slice(-2)}
          </div>
          <small>{fromNow}</small>
        </div>
      </div>
    </div>
  );
}
