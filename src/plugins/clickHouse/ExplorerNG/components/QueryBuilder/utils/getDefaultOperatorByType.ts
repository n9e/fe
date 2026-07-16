import { TYPE_OPERATOR_MAP } from '../constants';

export default function getDefaultOperatorByType(type?: string): string | undefined {
  if (type === undefined) return undefined;
  const operators = TYPE_OPERATOR_MAP[type];
  if (operators && operators.length > 0) {
    return operators[0];
  }
  return undefined;
}
