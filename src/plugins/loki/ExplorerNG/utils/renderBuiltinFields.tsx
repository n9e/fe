import React from 'react';
import _ from 'lodash';
import moment from 'moment';

import { LOKI_BUILTIN_FIELDS } from './filteredFields';

function stringifyValue(value: any) {
  if (_.isPlainObject(value) || _.isArray(value)) {
    return JSON.stringify(value);
  }
  return _.toString(value ?? '');
}

function formatTimestamp(value: any) {
  const text = _.toString(value);
  if (!text) return '';

  if (/^\d+$/.test(text)) {
    const timestamp = text.length >= 13 ? Number(text.slice(0, 13)) : Number(text) * 1000;
    if (Number.isFinite(timestamp)) {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS');
    }
  }

  const parsed = moment(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss.SSS') : text;
}

function formatValue(field: string, value: any) {
  if (field === '__timestamp__') {
    return formatTimestamp(value);
  }
  return stringifyValue(value);
}

export default function renderBuiltinFields(log: Record<string, any>) {
  const fields = _.filter(LOKI_BUILTIN_FIELDS, (field) => _.has(log, field));
  const labels = log.labels || {};
  if (_.isEmpty(fields) && _.isEmpty(labels)) return null;

  return (
    <div className='flex flex-wrap gap-2'>
      {_.map(labels, (value, key) => (
        <div key={`labels.${key}`} className='border border-primary rounded p-2 min-w-[120px] max-w-full'>
          <div className='text-primary mb-1 break-all'>labels.{key}</div>
          <div className='font-medium break-all whitespace-pre-wrap'>{stringifyValue(value)}</div>
        </div>
      ))}
      {_.map(fields, (field) => {
        return (
          <div key={field} className='border border-primary rounded p-2 min-w-[120px] max-w-full'>
            <div className='text-primary mb-1 break-all'>{field}</div>
            <div className='font-medium break-all whitespace-pre-wrap'>{formatValue(field, log[field])}</div>
          </div>
        );
      })}
    </div>
  );
}
