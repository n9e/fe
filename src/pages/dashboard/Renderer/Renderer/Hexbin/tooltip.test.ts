import { getTooltipContent } from './tooltip';

describe('getTooltipContent', () => {
  it('uses the formatted series name and omits metric labels when legend is configured', () => {
    expect(
      getTooltipContent({
        name: '机器: dev-flasheye-01',
        value: '58.904342',
        target: { legend: '机器: {{ident}}' },
        metric: {
          __name__: 'cpu_usage_idle',
          ident: 'dev-flasheye-01',
          env: 'prod',
        },
      }),
    ).toBe('<div><strong>机器: dev-flasheye-01 58.904342</strong></div>');
  });

  it('keeps the original metric name and label details when legend is not configured', () => {
    expect(
      getTooltipContent({
        value: 58.904342,
        metric: {
          __name__: 'cpu_usage_idle',
          ident: 'dev-flasheye-01',
          env: 'prod',
        },
      }),
    ).toBe('<div><strong>cpu_usage_idle: 58.904342</strong></div><div>ident: dev-flasheye-01</div><div>env: prod</div>');
  });

  it('keeps the selected value field behavior', () => {
    expect(
      getTooltipContent(
        {
          name: '机器: dev-flasheye-01',
          value: '58.904342',
          target: { legend: '机器: {{ident}}' },
          metric: {
            cpu: 'cpu-total',
          },
        },
        'cpu',
      ),
    ).toBe('<div><strong>机器: dev-flasheye-01 cpu-total</strong></div>');
  });
});
