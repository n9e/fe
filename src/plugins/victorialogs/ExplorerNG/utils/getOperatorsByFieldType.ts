import { VictoriaLogsFilter } from '../types';

const operators: VictoriaLogsFilter['op'][] = ['eq', 'neq', 'contains', 'not_contains', 'regex', 'not_regex', 'gt', 'gte', 'lt', 'lte', 'exists', 'not_exists'];

export default function getOperatorsByFieldType(): VictoriaLogsFilter['op'][] {
  return operators;
}
