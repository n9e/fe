import _ from 'lodash';

import { IN_OPERATORS, NULL_OPERATORS, BETWEEN_OPERATORS } from '../constants';

export default function describeFieldValue(operator: string, value?: string | number | Array<string | number>): string {
  const operatorStr = `<strong class="text-main">${operator}</strong>`;

  if (_.includes(IN_OPERATORS, operator)) {
    if (Array.isArray(value)) {
      return `${operatorStr} ${_.join(value, ' <strong class="text-main">AND</strong> ')}`;
    }
    return `${operatorStr} ${value}`;
  }

  if (_.includes(NULL_OPERATORS, operator)) {
    return operatorStr;
  }

  if (_.includes(BETWEEN_OPERATORS, operator)) {
    if (Array.isArray(value) && value.length === 2) {
      const currntOperatorStr = operator.replace('AND', '').trim();
      return `${currntOperatorStr} ${value[0]} <strong class="text-main">AND</strong> ${value[1]}`;
    }
    return `${operatorStr} ${value}`;
  }

  return `${operatorStr} ${value}`;
}
