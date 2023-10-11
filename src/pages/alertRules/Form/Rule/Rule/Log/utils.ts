import { defaultRuleConfig } from '@/pages/alertRules/Form/constants';

export const normalizeTime = (value?: number, unit?: 'second' | 'min' | 'hour') => {
  if (!value) {
    return value;
  }
  if (unit === 'second') {
    return value;
  }
  if (unit === 'min') {
    return value * 60;
  }
  if (unit === 'hour') {
    return value * 60 * 60;
  }
  if (unit === 'day') {
    return value * 60 * 60 * 24;
  }
  return value;
};

export function getDefaultValuesByCate(prod, cate) {
  return {
    prod,
    cate,
    datasource_ids: undefined,
    rule_config: defaultRuleConfig.logging,
  };
}
