import moment from 'moment';

import { getDashboardQueryStep } from './queryStep';

jest.mock('@/components/TimeRangePicker/utils', () => ({
  parseRange: (range: { start: unknown; end: unknown }) => range,
}));

describe('getDashboardQueryStep', () => {
  const time = { start: moment.unix(0), end: moment.unix(3600) };

  it('prefers minStep and uses maxDataPoints before panel width', () => {
    expect(getDashboardQueryStep({ time, maxDataPoints: 100, panelWidth: 1000, minStep: 60 })).toBe(60);
    expect(getDashboardQueryStep({ time, maxDataPoints: 100, panelWidth: 1000, minStep: 15 })).toBe(36);
  });

  it('uses panel width and caps the number of returned points', () => {
    expect(getDashboardQueryStep({ time, panelWidth: 800 })).toBe(15);
    expect(getDashboardQueryStep({ time: { start: moment.unix(0), end: moment.unix(22000) }, maxDataPoints: 22000, minStep: 1 })).toBe(2);
  });
});
