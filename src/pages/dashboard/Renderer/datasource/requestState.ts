import type { DashboardQueryState } from './types';

export class DashboardRequestSequence {
  private current = 0;

  begin() {
    this.current += 1;
    return this.current;
  }

  invalidate() {
    this.current += 1;
  }

  isLatest(sequence: number) {
    return sequence === this.current;
  }
}

export function acceptDashboardQueryState(previous: DashboardQueryState, next: Omit<DashboardQueryState, 'revision'>): DashboardQueryState {
  return {
    ...next,
    revision: previous.revision + 1,
  };
}
