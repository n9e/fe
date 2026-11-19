import type { IVariable } from '../../Variables/types';

/** 已定义的固定变量显示为禁用常量；未定义的变量直接跳过，不影响模板展示。 */
export function getEmbeddedVariables(variables: IVariable[], fixedValues: Record<string, string>): IVariable[] {
  return variables.map((variable) => {
    if (!Object.prototype.hasOwnProperty.call(fixedValues, variable.name)) return variable;
    const value = fixedValues[variable.name];
    return { ...variable, type: 'constant', definition: value, defaultValue: value, value, hide: false };
  });
}
