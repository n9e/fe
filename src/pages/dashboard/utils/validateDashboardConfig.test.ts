import { validateDashboardConfig } from './validateDashboardConfig';

const validDashboard = {
  panels: [
    {
      id: 'panel-1',
      type: 'timeseries',
      layout: {
        h: 4,
        w: 12,
        x: 0,
        y: 0,
        i: 'panel-1',
      },
    },
  ],
  var: [
    {
      name: 'cluster',
      type: 'query',
    },
  ],
};

describe('validateDashboardConfig', () => {
  it('returns no errors for configs without panels or variables', () => {
    const result = validateDashboardConfig({});

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns no errors for valid panels and variables', () => {
    const result = validateDashboardConfig(validDashboard);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns an error when panels is not an array', () => {
    const result = validateDashboardConfig({
      panels: {},
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('configs.panels must be an array');
  });

  it('returns errors for missing required panel fields', () => {
    const result = validateDashboardConfig({
      panels: [
        {
          type: 'timeseries',
          layout: {
            h: 4,
            w: 12,
            x: 0,
            y: 0,
          },
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining(['configs.panels[0].id must be a non-empty string', 'configs.panels[0].layout.i must be a non-empty string']));
  });

  it('returns an error when layout id does not match panel id', () => {
    const result = validateDashboardConfig({
      panels: [
        {
          id: 'panel-1',
          type: 'timeseries',
          layout: {
            h: 4,
            w: 12,
            x: 0,
            y: 0,
            i: 'panel-2',
          },
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('configs.panels[0].layout.i should equal configs.panels[0].id');
  });

  it('validates cached row child panels with the same loose panel rules', () => {
    const result = validateDashboardConfig({
      panels: [
        {
          id: 'row-1',
          type: 'row',
          layout: {
            h: 1,
            w: 24,
            x: 0,
            y: 0,
            i: 'row-1',
          },
          panels: [
            {
              type: 'timeseries',
              layout: {
                h: 4,
                w: 12,
                x: 0,
                y: 1,
                i: 'child-panel',
              },
            },
          ],
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('configs.panels[0].panels[0].id must be a non-empty string');
  });

  it('returns errors for invalid variables', () => {
    const result = validateDashboardConfig({
      var: [
        {
          type: 'query',
        },
        {
          name: 'cluster',
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining(['configs.var[0].name must be a non-empty string', 'configs.var[1].type must be a non-empty string']));
  });

  it('returns a validation warning instead of throwing when validation fails unexpectedly', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const configs = {};
    Object.defineProperty(configs, 'var', {
      get() {
        throw new Error('unexpected getter error');
      },
    });

    const result = validateDashboardConfig(configs);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['Dashboard panels/variables config validator failed']);
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });
});
