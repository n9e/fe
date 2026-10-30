import _ from 'lodash';

import type { Field } from '../ExplorerNG/types';

/**
 * 跨集群 _field_caps 返回的字段：同一字段有多种类型时只取返回顺序里的第一个。
 * 这样上层无法感知该字段在其它索引里还有别的类型（见 docs/log-context-pending-issues.md P1-2）。
 */
export default function buildFieldCapsFields(fieldCaps?: Record<string, Record<string, unknown>>): Field[] {
  return _.map(fieldCaps, (fieldObject, name) => ({
    field: name,
    type: _.keys(fieldObject)[0],
    indexable: true,
  }));
}
