import _ from 'lodash';

import { IN_OPERATORS, NULL_OPERATORS, BETWEEN_OPERATORS } from '../constants';

export default function describeFieldValue(operator: string, value?: string | number | Array<string | number>): string {
  const operatorStr = `<strong class="text-main bg-fc-200 px-1">${_.escape(operator)}</strong>`;

  if (_.includes(IN_OPERATORS, operator)) {
    if (Array.isArray(value)) {
      return `${operatorStr} ${_.join(_.map(value, _.escape), ' <strong class="text-main">AND</strong> ')}`;
    }
    return `${operatorStr} ${_.escape(String(value ?? ''))}`;
  }

  if (_.includes(NULL_OPERATORS, operator)) {
    return operatorStr;
  }

  if (_.includes(BETWEEN_OPERATORS, operator)) {
    if (Array.isArray(value) && value.length === 2) {
      const currntOperatorStr = operator.replace('AND', '').trim();
      return `${_.escape(currntOperatorStr)} ${_.escape(String(value[0] ?? ''))} <strong class="text-main">AND</strong> ${_.escape(String(value[1] ?? ''))}`;
    }
    return `${operatorStr} ${_.escape(String(value ?? ''))}`;
  }

  return `${operatorStr} ${_.escape(String(value ?? ''))}`;
}
