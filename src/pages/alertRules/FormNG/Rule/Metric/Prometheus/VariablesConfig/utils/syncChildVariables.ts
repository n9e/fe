import _ from 'lodash';

interface Variable {
  id: number;
  name: string;
  param_type: string;
  query: any;
}

interface ChildVariable {
  child_var_configs?: ChildVariable;
  param_val: {
    [var_name: string]: Variable;
  }[];
}

/**
 * 当 topVariables 新增、删除时，同步更新 childVariables.param_val 中的变量。
 * 以 id 为准
 * 如果 childVariables.param_val 中的变量在 topVariables 中不存在则删除。
 * 如果 topVariables 中的变量在 childVariables.param_val 中不存在则新增。
 * 如果存在 childVariables.child_var_configs 递归更新 childVariables.child_var_configs
 */
export default function syncChildVariables(topVariables: Variable[], childVariables?: ChildVariable) {
  const childVariablesCopy = _.cloneDeep(childVariables) || ({} as ChildVariable);

  childVariablesCopy.param_val = _.map(childVariablesCopy.param_val, (item) => {
    // 同步 topVariables 的变量名
    const newItem: {
      [var_name: string]: Variable;
    } = {};
    _.forEach(item, (variable) => {
      const topVariable = _.find(topVariables, (topVariable) => topVariable.id === variable.id);
      if (topVariable) {
        newItem[topVariable.name] = {
          ...variable,
          name: topVariable.name,
        };
      }
    });
    // 添加 topVariables 中新增的变量
    _.forEach(topVariables, (topVariable) => {
      if (!_.find(item, (variable) => variable.id === topVariable.id)) {
        newItem[topVariable.name] = topVariable;
      }
    });

    return newItem;
  });

  if (childVariablesCopy.child_var_configs) {
    childVariablesCopy.child_var_configs = syncChildVariables(topVariables, childVariablesCopy.child_var_configs);
  }

  return childVariablesCopy;
}
