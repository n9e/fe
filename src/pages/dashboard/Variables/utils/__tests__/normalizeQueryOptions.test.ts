/// <reference types="jest" />

import normalizeQueryOptions from '../normalizeQueryOptions';

describe('normalizeQueryOptions', () => {
  test('keeps string option behavior for non-gcm datasources', () => {
    expect(normalizeQueryOptions([{ label: 'Project 1', value: 'project-1' }], undefined, 'prometheus')).toEqual([
      {
        label: '[object Object]',
        value: '[object Object]',
      },
    ]);
  });

  test('keeps label and value for gcm option objects', () => {
    expect(normalizeQueryOptions([{ label: 'Project 1', value: 'project-1' }], undefined, 'gcm')).toEqual([{ label: 'Project 1', value: 'project-1' }]);
  });

  test('uses the existing regex extraction behavior for gcm option object values', () => {
    expect(normalizeQueryOptions([{ label: 'Project 1', value: 'project-1' }], '/project-(.*)/', 'gcm')).toEqual([{ label: '1', value: '1' }]);
  });
});
