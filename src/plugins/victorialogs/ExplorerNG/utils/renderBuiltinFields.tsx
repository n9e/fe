import React from 'react';
import _ from 'lodash';

import { VICTORIALOGS_BUILTIN_FIELDS } from './filteredFields';

function stringifyValue(value: any) {
  if (_.isPlainObject(value) || _.isArray(value)) {
    return JSON.stringify(value);
  }
  return _.toString(value ?? '');
}

export default function renderBuiltinFields(log: Record<string, any>) {
  const fields = _.filter(VICTORIALOGS_BUILTIN_FIELDS, (field) => _.has(log, field));
  if (_.isEmpty(fields)) return null;

  return (
    <div className='flex flex-wrap gap-2'>
      {_.map(fields, (field) => {
        return (
          <div key={field} className='border border-primary rounded p-2 min-w-[120px] max-w-full'>
            <div className='text-primary mb-1 break-all'>{field}</div>
            <div className='font-medium break-all whitespace-pre-wrap'>{stringifyValue(log[field])}</div>
          </div>
        );
      })}
    </div>
  );
}
