import type { AlertRuleConditionHandler } from '../types';
import elasticsearchQuery from './elasticsearch';
import prometheusQuery from './prometheus';
import lokiQuery from './loki';

const HANDLERS: Record<string, AlertRuleConditionHandler> = {
  elasticsearch: elasticsearchQuery,
  prometheus: prometheusQuery,
  loki: lokiQuery,
};

export function getAlertRuleConditionHandler(cate: string): AlertRuleConditionHandler {
  const handler = HANDLERS[cate];
  if (!handler) {
    throw new Error(`No alert-rule condition handler for datasource cate: ${cate}`);
  }
  return handler;
}

export function hasAlertRuleConditionHandler(cate: string) {
  return Boolean(HANDLERS[cate]);
}
