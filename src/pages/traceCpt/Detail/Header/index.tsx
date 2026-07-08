import React from 'react';
import { useTranslation } from 'react-i18next';

import _get from 'lodash/get';
import _maxBy from 'lodash/maxBy';
import _values from 'lodash/values';
import { formatDatetime, formatDuration } from '../../utils/date';
import { Trace } from '../../type';
import { IViewRange, ViewRangeTimeUpdate, TUpdateViewRangeTimeFunction } from '../types';
import LabeledList from './LabeledList';
import SpanGraph from './SpanGraph';

interface IProps {
  trace: Trace;
  viewRange: IViewRange;
  updateNextViewRangeTime: (update: ViewRangeTimeUpdate) => void;
  updateViewRangeTime: TUpdateViewRangeTimeFunction;
}

export default function TraceDetailHeader(props: IProps) {
  const { t } = useTranslation('trace');
  const { trace, viewRange, updateNextViewRangeTime, updateViewRangeTime } = props;
  const HEADER_ITEMS = [
    {
      key: 'timestamp',
      label: t('detail.start_time'),
      renderer: (trace: Trace) => {
        const dateStr = formatDatetime(trace.startTime);
        const match = dateStr.match(/^(.+)(\.\d+)$/);
        return match ? (
          <span className='TracePageHeader--overviewItem--value'>
            {match[1]}
            <span className='TracePageHeader--overviewItem--valueDetail'>{match[2]}</span>
          </span>
        ) : (
          dateStr
        );
      },
    },
    {
      key: 'duration',
      label: t('detail.duration'),
      renderer: (trace: Trace) => formatDuration(trace.duration),
    },
    {
      key: 'Service',
      label: 'Services',
      renderer: (trace: Trace) => new Set(_values(trace.processes).map((p) => p.serviceName)).size,
    },
    {
      key: 'depth',
      label: t('detail.depth'),
      renderer: (trace: Trace) => _get(_maxBy(trace.spans, 'depth'), 'depth', 0) + 1,
    },
    {
      key: 'span-count',
      label: t('detail.total'),
      renderer: (trace: Trace) => trace.spans.length,
    },
  ];
  const summaryItems = HEADER_ITEMS.map((item) => {
    const { renderer, ...rest } = item;
    return { ...rest, value: renderer(trace) };
  });

  return (
    <div className='tracing-detail-header'>
      <div className='title'>
        <LabeledList items={summaryItems} />
      </div>
      <SpanGraph trace={trace} viewRange={viewRange} updateNextViewRangeTime={updateNextViewRangeTime} updateViewRangeTime={updateViewRangeTime} />
    </div>
  );
}
