import { convertThresholdsGrafanaToN9E, convertValueMappingsGrafanaToN9E } from './options';

describe('Grafana color option conversion', () => {
  it('maps builtin colors in thresholds and each supported value-mapping shape', () => {
    const thresholds = convertThresholdsGrafanaToN9E({
      thresholds: {
        mode: 'absolute',
        steps: [
          { color: 'green', value: null },
          { color: 'semi-dark-red', value: 80 },
        ],
      },
    });
    const valueMappings = convertValueMappingsGrafanaToN9E([
      {
        type: 'value',
        options: {
          ok: { text: 'OK', color: 'light-green' },
          custom: { text: 'Custom', color: '#123456' },
        },
      },
      { type: 'range', options: { from: 0, to: 10, result: { text: 'Low', color: 'blue' } } },
      { type: 'special', options: { match: 'null', result: { text: 'Empty', color: 'dark-purple' } } },
    ]);

    expect(thresholds.steps.map((step: { color: string }) => step.color)).toEqual(['green-9', 'red-10']);
    expect(valueMappings.map((mapping) => mapping.result.color)).toEqual(['green-8', '#123456', 'blue-9', 'purple-11']);
  });
});
