import _ from 'lodash';

import { allCates } from '@/components/AdvancedWrap/utils';
import type { Cate } from '@/components/AdvancedWrap/utils';
import { IS_PLUS } from '@/utils/constant';

import { ENABLED_VIEW_CATES } from '../constants';

interface DatasourceItem {
  plugin_type?: string;
  [key: string]: any;
}

export function isLogExplorerDatasourceCateSupported(cate?: string, cates: Pick<Cate, 'value' | 'type' | 'graphPro'>[] = allCates, isPlus = IS_PLUS) {
  if (!cate || !_.includes(ENABLED_VIEW_CATES, cate)) {
    return false;
  }

  const cateData = _.find(cates, { value: cate });
  if (!cateData || !_.includes(cateData.type, 'logging')) {
    return false;
  }

  return cateData.graphPro ? isPlus : true;
}

export function filterLogExplorerDatasourceList<T extends DatasourceItem>(list: T[], cates: Pick<Cate, 'value' | 'type' | 'graphPro'>[] = allCates, isPlus = IS_PLUS) {
  return _.filter(list, (item) => isLogExplorerDatasourceCateSupported(item.plugin_type, cates, isPlus));
}
