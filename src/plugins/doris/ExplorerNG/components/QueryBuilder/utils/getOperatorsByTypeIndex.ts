import _ from 'lodash';

import { Field } from '../../../types';
import { STRING_TYPES, TYPE_OPERATOR_MAP } from '../constants';

export default function getOperatorsByTypeIndex(field?: Field): string[] | undefined {
  if (!field) return [];

  const fieldType = field.normalized_type;
  const { index } = field;

  if (fieldType) {
    // 如果用户选择的字段是字符串类型
    if (_.includes(STRING_TYPES, fieldType)) {
      // 且该字段上未创建倒排索引，或者创建了倒排索引，但是未分词，则操作符下拉列表不展示 MATCH 系列
      if (index?.index_type !== 'INVERTED' || (index?.index_type === 'INVERTED' && !index?.properties?.parser)) {
        const operators = _.filter(TYPE_OPERATOR_MAP[fieldType], (operator) => {
          return !_.startsWith(operator, 'MATCH');
        });
        return operators;
      }
      // 该字段上创建了倒排索引，且有分词，但是 support_phrase 特性不为真， 则操作符下拉列表不展示 MATCH_PHASE, MATCH_PHRASE_PREFIX, MATCH_PHASE_EDGE
      if (index?.index_type === 'INVERTED' && index?.properties.support_phrase === false) {
        const operators = _.filter(TYPE_OPERATOR_MAP[fieldType], (operator) => {
          return !_.startsWith(operator, 'MATCH_PHRASE');
        });
        return operators;
      }
      return TYPE_OPERATOR_MAP[fieldType] ?? [];
    } else {
      return TYPE_OPERATOR_MAP[fieldType] ?? [];
    }
  }
  return [];
}
