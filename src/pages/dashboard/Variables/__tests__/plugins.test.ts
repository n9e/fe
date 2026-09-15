import type { DashboardVariablePlugin } from '../pluginTypes';

const builtinPlugin: DashboardVariablePlugin = {
  capabilities: () => ({ multi: false, all: false }),
  transformQuery: (query) => query,
};
const extensionPlugin: DashboardVariablePlugin = {
  capabilities: () => ({ multi: true, all: true, allValuePlaceholder: '.*' }),
  transformQuery: (query) => ({ ...query, transformed: true }),
};

function loadRegistry(builtin: Record<string, DashboardVariablePlugin>, extension?: Record<string, DashboardVariablePlugin>) {
  jest.resetModules();
  jest.doMock('../builtinPlugins', () => ({ dashboardVariablePlugins: builtin }));
  jest.doMock('plus:/parcels/Dashboard/variablePlugins', () =>
    extension === undefined ? jest.requireActual('../../../../../plugins/PlusPlaceholder') : { dashboardVariablePlugins: extension },
  );
  return jest.requireActual('../plugins') as typeof import('../plugins');
}

afterEach(() => {
  jest.resetModules();
  jest.dontMock('../builtinPlugins');
  jest.dontMock('plus:/parcels/Dashboard/variablePlugins');
});

test('the real open-source placeholder explicitly exports an empty extension registry', () => {
  const placeholder = jest.requireActual('../../../../../plugins/PlusPlaceholder');
  expect(placeholder.dashboardVariablePlugins).toEqual({});
  expect(typeof placeholder.dashboardVariablePlugins).toBe('object');
});

test('open-source builds retain registered public capabilities without Plus implementations', () => {
  const { getDashboardVariablePlugin } = loadRegistry({ prometheus: builtinPlugin });
  expect(getDashboardVariablePlugin('prometheus')).toBe(builtinPlugin);
  expect(getDashboardVariablePlugin('prometheus')?.capabilities()).toEqual({ multi: false, all: false });
  expect(getDashboardVariablePlugin('gcm')).toBeUndefined();
});

test('Plus extensions coexist with public plugins and override same-name registrations', () => {
  const { getDashboardVariablePlugin } = loadRegistry({ prometheus: builtinPlugin, shared: builtinPlugin }, { gcm: extensionPlugin, shared: extensionPlugin });
  expect(getDashboardVariablePlugin('prometheus')).toBe(builtinPlugin);
  expect(getDashboardVariablePlugin('gcm')).toBe(extensionPlugin);
  expect(getDashboardVariablePlugin('shared')).toBe(extensionPlugin);
});

test.each([undefined, '', 'cw', 'unknown', 'constructor', '__proto__'])('unregistered category %s keeps the legacy fallback', (cate) => {
  const { getDashboardVariablePlugin } = loadRegistry({});
  expect(getDashboardVariablePlugin(cate)).toBeUndefined();
});
