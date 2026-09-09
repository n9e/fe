import type { ITarget } from '@/pages/dashboard/types';

import { getTargetRefId, inferTargetResultType, isExpressionTarget } from './target';

describe('dashboard target helpers', () => {
  it('creates spreadsheet-style RefIDs', () => {
    expect([0, 25, 26, 27, 701].map(getTargetRefId)).toEqual(['A', 'Z', 'AA', 'AB', 'ZZ']);
  });

  it('identifies current and legacy expression targets', () => {
    expect(isExpressionTarget({ kind: 'expression' } as ITarget)).toBe(true);
    expect(isExpressionTarget({ __mode__: '__expr__' } as ITarget)).toBe(true);
    expect(isExpressionTarget({ kind: 'query' } as ITarget)).toBe(false);
  });

  it('infers log and time-series result types from the active query shape', () => {
    expect(inferTargetResultType({ query: { mode: 'logs' } } as ITarget)).toBe('logs');
    expect(inferTargetResultType({ query: { values: [{ func: 'rawData' }] } } as ITarget)).toBe('logs');
    expect(inferTargetResultType({ query: { mode: 'time_series' }, resultType: 'logs' } as ITarget)).toBe('time_series');
    expect(inferTargetResultType({ resultType: 'logs' } as ITarget)).toBe('logs');
  });
});
