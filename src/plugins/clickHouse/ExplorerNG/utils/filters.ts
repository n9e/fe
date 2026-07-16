import _ from 'lodash';

import { FilterConfig } from '../types';

export function getEnabledFilters(filters?: FilterConfig[]) {
  return _.filter(filters || [], (filter) => !filter?.disabled);
}
