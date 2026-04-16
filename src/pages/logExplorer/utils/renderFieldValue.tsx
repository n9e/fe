import React from 'react';
import { isNumber, isBoolean } from 'lodash';

import { toString } from '@/pages/logExplorer/components/LogsViewer/components/LogFieldValue/util';

export default function renderFieldValue(value: string | null | number | boolean) {
  if (value === null) {
    return (
      <span style={{ color: 'var(--fc-text-4)' }} className='italic'>
        null
      </span>
    );
  }
  if (value === '') {
    return <span>""</span>;
  }
  if (isNumber(value)) {
    return (
      <span
      // style={{ color: 'var(--fc-fill-success)' }}
      >
        {value}
      </span>
    );
  }
  if (isBoolean(value)) {
    return (
      <span
      // style={{ color: 'var(--fc-purple-6-color)' }}
      >
        {String(value)}
      </span>
    );
  }
  return toString(value);
}
