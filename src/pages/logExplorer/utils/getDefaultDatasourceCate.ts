import _ from 'lodash';

import { allCates } from '@/components/AdvancedWrap/utils';
import { ENABLED_VIEW_CATES } from '@/pages/logExplorer/constants';

export default function getDefaultDatasourceCate(datasourceList: any[], defaultCate: string): string | undefined {
  if (_.includes(ENABLED_VIEW_CATES, defaultCate) && _.find(datasourceList, { plugin_type: defaultCate })) {
    return defaultCate;
  }

  const findResult = _.find(datasourceList, (item) => {
    const cateObj = _.find(allCates, { value: item.plugin_type });
    if (cateObj && _.includes(cateObj.type, 'logging') && _.includes(ENABLED_VIEW_CATES, item.plugin_type)) {
      return true;
    }
  });

  if (findResult) {
    return findResult.plugin_type;
  }
}
