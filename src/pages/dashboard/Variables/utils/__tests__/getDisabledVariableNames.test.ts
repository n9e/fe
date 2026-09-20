import getDisabledVariableNames from '../getDisabledVariableNames';

describe('getDisabledVariableNames', () => {
  it('parses comma-separated variable names and ignores empty values', () => {
    expect(getDisabledVariableNames(' region,host, ,region ')).toEqual(new Set(['region', 'host']));
  });

  it('supports repeated query parameters and ignores invalid values', () => {
    expect(getDisabledVariableNames(['region,host', null, 'service'])).toEqual(new Set(['region', 'host', 'service']));
  });
});
