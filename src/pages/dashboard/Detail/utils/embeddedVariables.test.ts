import { getEmbeddedVariables } from './embeddedVariables';
import getValueByOptions from '../../Variables/utils/getValueByOptions';
import initializeVariablesValue from '../../Variables/utils/initializeVariablesValue';
import type { IVariable } from '../../Variables/types';

test('fixes the current device for runtime initialization without mutating the template', () => {
  const template: IVariable[] = [
    { name: 'ident', type: 'query', definition: 'label_values(snmp_up, agent_host)', datasource: { cate: 'prometheus' } },
    { name: 'prom', type: 'datasource', definition: 'prometheus', datasource: { cate: 'prometheus' } },
  ];
  const runtime = getEmbeddedVariables(template, { ident: '10.0.0.7' });
  expect(runtime[0]).toMatchObject({ name: 'ident', type: 'constant', definition: '10.0.0.7', hide: false });
  expect(getValueByOptions({ variable: runtime[0], variableValueFixed: false, itemOptions: [] })).toBe('10.0.0.7');
  expect(initializeVariablesValue(runtime, { ident: 'other-device' }, { dashboardId: 1, persistState: false })[0].value).toBe('10.0.0.7');
  expect(template[0]).toEqual({ name: 'ident', type: 'query', definition: 'label_values(snmp_up, agent_host)', datasource: { cate: 'prometheus' } });
  expect(runtime[1]).toBe(template[1]);
});

test('keeps templates without the conventional device variable unchanged and renderable', () => {
  const template: IVariable[] = [
    { name: 'agent_host', type: 'query', definition: 'label_values(snmp_up, agent_host)', datasource: { cate: 'prometheus' }, value: 'another-device' },
  ];
  const runtime = getEmbeddedVariables(template, { ident: '10.0.0.7' });
  expect(runtime).toEqual(template);
  expect(runtime[0]).toBe(template[0]);
  expect(runtime[0]).toMatchObject({ type: 'query', value: 'another-device' });
  expect(getEmbeddedVariables([], { ident: '10.0.0.7' })).toEqual([]);
});
