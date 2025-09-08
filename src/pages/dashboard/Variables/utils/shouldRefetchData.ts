import _ from 'lodash';

import { IVariable } from '../types';

export default function shouldRefetchData(variable: IVariable, index: number, variables: IVariable[]) {
  // 如果 type 是 datasource, datasourceIdentifier, query 时，检查后面的所有 query 类型变量中是否有依赖当前变量的
  // 目前 query 类型变量的配置里有如下几种形式会引用变量：
  // 1. datasource.value 数据源值
  // 2. definition (prometheus 会用到)
  // 3. query.query (标准结构)
  if (_.includes(['datasource', 'datasourceIdentifier', 'query'], variable.type)) {
    const regex = new RegExp(`\\$${variable.name}\\b|\\$\\{${variable.name}\\}|\\[\\[${variable.name}\\]\\]`, 'g');
    for (let i = index + 1; i < variables.length; i++) {
      const v = variables[i];
      if (v.type === 'query') {
        if (
          (_.isString(v.definition) && regex.test(v.definition)) ||
          (_.isString(v.datasource?.value) && regex.test(v.datasource.value)) ||
          (_.isString(v.query?.query) && regex.test(v.query.query))
        ) {
          return true;
        }
      }
    }
  }
  return false;
}
