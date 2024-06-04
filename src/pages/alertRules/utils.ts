import _ from 'lodash';

export const parseTimeToValueAndUnit = (value?: number) => {
  if (!value) {
    return {
      value: value,
      unit: 'min',
    };
  }
  let time = value / 60;
  if (time < 60) {
    return {
      value: time,
      unit: 'min',
    };
  }
  time = time / 60;
  if (time < 24) {
    return {
      value: time,
      unit: 'hour',
    };
  }
  time = time / 24;
  return {
    value: time,
    unit: 'day',
  };
};

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

export const stringifyExpressions = (
  expressions: {
    ref: string;
    label: string;
    comparisonOperator: string;
    value: string;
    logicalOperator?: string;
  }[],
) => {
  const logicalOperator = _.get(expressions, '[0].logicalOperator');
  let exp = '';
  _.forEach(expressions, (expression, index) => {
    if (index !== 0) {
      exp += ` ${logicalOperator} `;
    }
    exp += `$${expression.ref}${expression.label ? `.${expression.label}` : ''} ${expression.comparisonOperator} ${expression.value}`;
  });
  return exp;
};
