import _ from 'lodash';
import { IVariable } from '../../VariableConfig/definition';
import { replaceExpressionVars } from '../../VariableConfig/constant';

const replaceAllPolyfill = (str, substr, newSubstr): string => {
  let result = str;
  while (result.includes(substr)) {
    result = result.replace(substr, newSubstr);
  }
  return result;
};

export const replaceExpressionVarsSpecifyRule = (
  params: {
    expression: string;
    scopedVars: any;
  },
  rule: {
    regex: string;
    getPlaceholder: (expression: string) => string;
  },
) => {
  const { expression, scopedVars } = params;
  const { getPlaceholder } = rule;
  let newExpression = expression;

  _.forEach(scopedVars, (vValue, vKey) => {
    newExpression = replaceAllPolyfill(newExpression, getPlaceholder(vKey), vValue);
  });

  return newExpression;
};

export const replaceExpressionScopedVars = (expression: string, scopedVars: any) => {
  let newExpression = expression;
  newExpression = replaceExpressionVarsSpecifyRule(
    { expression: newExpression, scopedVars },
    {
      regex: '\\$[0-9a-zA-Z_]+',
      getPlaceholder: (expression: string) => `$${expression}`,
    },
  );
  newExpression = replaceExpressionVarsSpecifyRule(
    { expression: newExpression, scopedVars },
    {
      regex: '\\${[0-9a-zA-Z_]+}',
      getPlaceholder: (expression: string) => '${' + expression + '}',
    },
  );
  return newExpression;
};

export default function replaceFieldWithVariable(dashboardId, value: string, variableConfig?: IVariable[], scopedVars?: any) {
  if (!value) return value;
  if (scopedVars) {
    value = replaceExpressionScopedVars(value, scopedVars);
  }
  if (!variableConfig) {
    return value;
  }
  return replaceExpressionVars(value, variableConfig, variableConfig.length, dashboardId);
}
