import { LokiParsedFieldFilter } from '../types';

const operators: LokiParsedFieldFilter['op'][] = ['=', '!=', '=~', '!~', '>', '>=', '<', '<='];

export default function getOperatorsByFieldType(): LokiParsedFieldFilter['op'][] {
  return operators;
}
