import _ from 'lodash';

import { allCates } from '@/components/AdvancedWrap/utils';

export default function getDefaultDatasourceCate(datasourceList: any[], defaultCate: string) {
  if (_.find(datasourceList, { plugin_type: defaultCate })) {
    return defaultCate;
  }

  const findResult = _.find(datasourceList, (item) => {
    const cateObj = _.find(allCates, { value: item.plugin_type });
    if (cateObj && _.includes(cateObj.type, 'logging')) {
      return true;
    }
  });

  if (findResult) {
    return findResult.plugin_type;
  }

  return defaultCate;
}
