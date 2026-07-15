import { Field } from '../../../types';
import { TYPE_OPERATOR_MAP } from '../constants';

export default function getOperatorsByTypeIndex(field?: Field): string[] | undefined {
  if (!field) return [];

  const fieldType = field.normalized_type;
  return fieldType ? TYPE_OPERATOR_MAP[fieldType] ?? [] : [];
}
