import { acceptDashboardQueryState, DashboardRequestSequence } from './requestState';
import type { DashboardQueryState } from './types';

describe('dashboard local request state', () => {
  const initialState: DashboardQueryState = {
    query: [],
    series: [],
    errorsByRef: {},
    error: '',
    loading: false,
    loaded: false,
    range: {},
    revision: 4,
  };

  it('accepts only the latest local request sequence', () => {
    const coordinator = new DashboardRequestSequence();
    const first = coordinator.begin();
    const second = coordinator.begin();

    expect(coordinator.isLatest(first)).toBe(false);
    expect(coordinator.isLatest(second)).toBe(true);

    coordinator.invalidate();
    expect(coordinator.isLatest(second)).toBe(false);
  });

  it('increments revision only when a terminal state is accepted', () => {
    const loadingState = {
      ...initialState,
      loading: true,
    };
    expect(loadingState.revision).toBe(4);

    const accepted = acceptDashboardQueryState(initialState, {
      query: [],
      series: [{ id: 'A' }],
      errorsByRef: {},
      error: '',
      loading: false,
      loaded: true,
      range: {},
    });
    expect(accepted.revision).toBe(5);
  });
});
