import _ from 'lodash';

import { isLogOrderField } from '@/pages/logExplorer/components/LogOrderContext/utils';

import type { Field } from '../ExplorerNG/types';

export default function buildFieldCapsFields(fieldCaps?: Record<string, Record<string, unknown>>): Field[] {
  return _.map(fieldCaps, (fieldObject, name) => ({
    field: name,
    type: _.keys(fieldObject)[0],
    indexable: true,
    ...(isLogOrderField(name) ? { logOrderTypes: Object.keys(fieldObject) } : {}),
  }));
}
