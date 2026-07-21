import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';

export function isQueryVariableMultiSelectEnabled(datasourceCate: string, queryType?: string) {
  if (_.includes([DatasourceCateEnum.prometheus, DatasourceCateEnum.elasticsearch, DatasourceCateEnum.pgsql, DatasourceCateEnum.mysql], datasourceCate)) {
    return true;
  }
  if (datasourceCate === DatasourceCateEnum.gcm) {
    return queryType === 'labelValues';
  }
  return datasourceCate === DatasourceCateEnum.cloudwatch && queryType === 'dimensionValues';
}
