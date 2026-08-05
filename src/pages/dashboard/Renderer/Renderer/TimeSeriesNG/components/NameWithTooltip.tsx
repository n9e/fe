import React from 'react';
import _ from 'lodash';
import { Tooltip } from 'antd';

interface NameWithTooltipRecord {
  name?: string;
  metric: Record<string, string | undefined>;
  offset?: string;
}

export default function NameWithTooltip({ record, children }: { record: NameWithTooltipRecord; children: React.ReactNode }) {
  const name = _.get(record, 'name');
  const metric = _.get(record, 'metric.__name__');
  return (
    <Tooltip
      placement='left'
      mouseEnterDelay={0.5}
      title={
        <div>
          <div>{_.get(record, 'name')}</div>
          {name !== metric && <div>{_.get(record, 'metric.__name__')}</div>}
          <div>{record.offset && record.offset !== 'current' ? `offfset ${record.offset}` : ''}</div>
          {_.map(_.omit(record.metric, '__name__'), (val, key) => {
            return (
              <div key={key}>
                {key}={val}
              </div>
            );
          })}
        </div>
      }
      getTooltipContainer={() => document.body}
    >
      {children}
    </Tooltip>
  );
}
