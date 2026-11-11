jest.mock('@/utils/constant', () => ({ IS_PLUS: false }));
import {
  customProdCates,
  customProdDefaults,
  customProdFormValues,
  customProdInitialValues,
  customProdLabel,
  customProdOptions,
  customProdUrlValues,
  isCustomProd,
} from './customProds';
import * as placeholder from '../../../../plugins/PlusPlaceholder';

test('open-source build exposes no custom products and keeps values unchanged', () => {
  const values = { prod: 'metric', rule_config: { queries: [] } };
  expect(customProdOptions).toEqual([]);
  expect(customProdCates()).toEqual([]);
  expect(isCustomProd('agentobs')).toBe(false);
  expect(customProdLabel('agentobs')).toBeUndefined();
  expect(customProdDefaults('agentobs')).toBeUndefined();
  expect(customProdUrlValues('?prod=agentobs')).toBeUndefined();
  expect(customProdFormValues(values)).toBe(values);
  expect(customProdInitialValues(values)).toBe(values);
  expect(placeholder.customRuleTypeOptions).toEqual([]);
  expect(placeholder.isCustomRuleProd('agentobs')).toBe(false);
  expect(placeholder.getCustomProdDefaultValues('agentobs')).toBeUndefined();
  expect(placeholder.getCustomProdUrlValues('?prod=agentobs')).toBeUndefined();
  expect(placeholder.processCustomProdFormValues(values)).toBe(values);
  expect(placeholder.processCustomProdInitialValues(values)).toBe(values);
});
