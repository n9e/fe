import _ from 'lodash';

import { isLogExplorerDatasourceCateSupported } from './datasourceAvailability';

export default function getDefaultDatasourceCate(datasourceList: any[], defaultCate: string): string | undefined {
  if (isLogExplorerDatasourceCateSupported(defaultCate) && _.find(datasourceList, { plugin_type: defaultCate })) {
    return defaultCate;
  }

  const findResult = _.find(datasourceList, (item) => {
    return isLogExplorerDatasourceCateSupported(item.plugin_type);
  });

  if (findResult) {
    return findResult.plugin_type;
  }
}
