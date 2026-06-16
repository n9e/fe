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
  return localStorage.getItem(localeKey) || businessGroup.ids || '-2';
}

export function getDefaultGidsInDashboard(queryParams: any, localeKey: string, businessGroup: any) {
  if (queryParams['preset-filter'] === 'public') {
    return '-1';
  }
  return localStorage.getItem(localeKey) || businessGroup.ids || '-1';
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
