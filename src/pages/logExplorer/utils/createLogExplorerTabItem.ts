import _ from 'lodash';

import { LogExplorerTabItem } from '../types';
import { isLogExplorerDatasourceCateSupported } from './datasourceAvailability';

interface Params {
  activeItem?: LogExplorerTabItem;
  key: string;
  name: string;
  defaultDatasourceCate: string;
  defaultDatasourceValue: number;
  logsDefaultRange?: any;
  datasourceList?: { id: number; plugin_type?: string }[];
}

export function createLogExplorerTabItem(params: Params): LogExplorerTabItem {
  const { activeItem, key, name, defaultDatasourceCate, defaultDatasourceValue, logsDefaultRange, datasourceList } = params;
  const activeDatasourceCate = activeItem?.formValues?.datasourceCate;
  const activeDatasourceValue = activeItem?.formValues?.datasourceValue;
  const activeDatasourceExists = !datasourceList || _.some(datasourceList, (item) => item.id === activeDatasourceValue && item.plugin_type === activeDatasourceCate);

  if (activeItem && isLogExplorerDatasourceCateSupported(activeDatasourceCate) && activeDatasourceExists) {
    return {
      ..._.omit(activeItem, ['name']),
      key,
      name,
      isInited: false,
      // 新增页签不自动查询，仅复制查询条件（运行时标记，不持久化）
      isNewTab: true,
    };
  }

  return {
    key,
    name,
    isInited: false,
    isNewTab: true,
    formValues: {
      datasourceCate: defaultDatasourceCate,
      datasourceValue: defaultDatasourceValue,
      query: {
        range: logsDefaultRange,
      },
    },
  };
}
