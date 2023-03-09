// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react';
import cx from 'classnames';
import _sortBy from 'lodash/sortBy';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import AccordianKeyValues from './AccordianKeyValues';
import { formatDuration } from '../../../utils/date';
import { TNil } from '../../../type';
import { Log, KeyValuePair, Link } from '../../../type';
import './AccordianLogs.css';

type AccordianLogsProps = {
  interactive?: boolean;
  isOpen: boolean;
  linksGetter: ((pairs: KeyValuePair[], index: number) => Link[]) | TNil;
  logs: Log[];
  onItemToggle?: (log: Log) => void;
  onToggle?: () => void;
  openedItems?: Set<Log>;
  timestamp: number;
};

export default function AccordianLogs(props: AccordianLogsProps) {
  const { interactive, isOpen, linksGetter, logs, openedItems, onItemToggle, onToggle, timestamp } = props;
  const [openedLogTimestamps, setOpenedLogTimestamps] = React.useState<number[]>([]);
  let arrow: React.ReactNode | null = null;
  let HeaderComponent: 'span' | 'a' = 'span';
  let headerProps: Object | null = null;
  if (interactive) {
    arrow = isOpen ? <DownOutlined /> : <RightOutlined />;
    HeaderComponent = 'a';
    headerProps = {
      'aria-checked': isOpen,
      onClick: onToggle,
      role: 'switch',
    };
  }

  const handleCollapse = (log: Log) => {
    const i = openedLogTimestamps.indexOf(log.timestamp);
    if (i === -1) {
      setOpenedLogTimestamps([...openedLogTimestamps, log.timestamp]);
    } else {
      const newLogTimestamps = [...openedLogTimestamps];
      newLogTimestamps.splice(i, 1);
      setOpenedLogTimestamps(newLogTimestamps);
    }
  };
  return (
    <div className='AccordianLogs'>
      <HeaderComponent className={cx('AccordianLogs--header', { 'is-open': isOpen })} {...headerProps}>
        {arrow} <strong>Logs</strong> ({logs.length})
      </HeaderComponent>
      {isOpen && (
        <div className='AccordianLogs--content'>
          {_sortBy(logs, 'timestamp').map((log, i) => (
            <AccordianKeyValues
              // `i` is necessary in the key because timestamps can repeat
              // eslint-disable-next-line react/no-array-index-key
              key={`${log.timestamp}-${i}`}
              className={i < logs.length - 1 ? 'ub-mb1' : null}
              data={log.fields || []}
              highContrast
              interactive={interactive}
              isOpen={openedLogTimestamps.includes(log.timestamp)}
              label={`${formatDuration(log.timestamp - timestamp)}`}
              linksGetter={linksGetter}
              onToggle={interactive ? () => handleCollapse(log) : null}
            />
          ))}
          <small className='AccordianLogs--footer'>Log timestamps are relative to the start time of the full trace.</small>
        </div>
      )}
    </div>
  );
}

AccordianLogs.defaultProps = {
  interactive: true,
  linksGetter: undefined,
  onItemToggle: undefined,
  onToggle: undefined,
  openedItems: undefined,
};
