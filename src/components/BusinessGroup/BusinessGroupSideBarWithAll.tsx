import React from 'react';
import { useTranslation } from 'react-i18next';

import BusinessGroup, { getCleanBusinessGroupIds } from './';
import './locale';

/**
 * gids 特殊值
 * -1: 公共 // 目前只对应公开仪表盘
 * -2: 全部
 */
// const ids = gids === '-2' ? undefined : gids;

interface Props {
  gids?: string;
  setGids: (gids?: string) => void;
  localeKey: string;
  showPublicOption?: boolean;
  publicOptionLabel?: string;
  allOptionLabel?: string;
  allOptionTooltip?: string;
}

export function getDefaultGids(localeKey: string, businessGroup: any, queryParamsIds?: string | (string | null)[] | null) {
  if (queryParamsIds && typeof queryParamsIds === 'string') {
    return queryParamsIds;
  }
  // 全局业务组优先：跨页面切换时继承其它页面选择的具体业务组 / “全部”。
  // 其它页面专属的预置值（-1 公开、0 未分组）对本页无效，回退到本页 localStorage 记忆或“全部”。
  const globalIds = businessGroup.ids;
  if (globalIds && globalIds !== '-1' && globalIds !== '0') {
    return globalIds;
  }
  return localStorage.getItem(localeKey) || '-2';
}

export function getDefaultGidsInDashboard(queryParams: any, localeKey: string, businessGroup: any) {
  if (typeof queryParams.ids === 'string') {
    return queryParams.ids;
  }
  if (queryParams['preset-filter'] === 'public') {
    return '-1';
  }
  return businessGroup.ids || localStorage.getItem(localeKey) || '-1';
}

export default function BusinessGroupSideBarWithAll(props: Props) {
  const { t } = useTranslation('BusinessGroup');
  const { gids, setGids, localeKey, showPublicOption, publicOptionLabel, allOptionLabel, allOptionTooltip } = props;

  const presetFilters: { value: string; label: string; tooltip?: string }[] = [];
  if (showPublicOption && publicOptionLabel) {
    presetFilters.push({ value: '-1', label: publicOptionLabel });
  }
  presetFilters.push({ value: '-2', label: allOptionLabel || t('default_filter.all'), tooltip: allOptionTooltip });

  return (
    <BusinessGroup
      selected={gids}
      presetFilters={presetFilters}
      presetFilterTitle={t('default_filter.title')}
      localeKey={localeKey}
      onSelect={(key) => {
        const ids = getCleanBusinessGroupIds(key);
        setGids(ids);
      }}
    />
  );
}
