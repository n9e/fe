import _ from 'lodash';

import { Field } from '@/pages/logExplorer/types';

/**
 * 沿点号逐级向上回退，返回第一个存在于 indexData 的真实字段名；都不存在时返回 ''。
 * 日志行 flatten 后，值是 JSON 文本的 text 列会展开出 fctags.dirname 这类名字，它们不是表字段，
 * 只有 VARIANT 列的子字段才会由后端 /doris-index 返回。Doris 字段名不区分大小写，故不敏感匹配。
 */
export default function getValidIndexName(params: { fieldName: string; parentKey?: string; indexData: Field[] }): string {
  const { fieldName, parentKey, indexData } = params;
  const parts = _.split(parentKey ? `${parentKey}.${fieldName}` : fieldName, '.');
  for (let end = parts.length; end > 0; end--) {
    const candidate = _.join(_.slice(parts, 0, end), '.');
    const matched = _.find(indexData, (item) => _.toLower(item.field) === _.toLower(candidate));
    if (matched) {
      return matched.field;
    }
  }
  return '';
}
