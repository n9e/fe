import React from 'react';
import _ from 'lodash';
import { Tooltip } from 'antd';

export default function NameWithTooltip({ record, children }) {
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
