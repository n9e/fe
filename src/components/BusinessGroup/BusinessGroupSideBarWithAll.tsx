import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Space, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';

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
  const location = useLocation();
  const query = queryString.parse(location.search);
  const history = useHistory();
  const { gids, setGids, localeKey, showPublicOption, publicOptionLabel, allOptionLabel, allOptionTooltip } = props;

  return (
    <BusinessGroup
      renderHeadExtra={() => {
        return (
          <div>
            <div className='n9e-biz-group-container-group-title'>{t('default_filter.title')}</div>
            {showPublicOption && publicOptionLabel && (
              <div
                className={classNames({
                  'n9e-biz-group-item': true,
                  active: gids === '-1',
                })}
                onClick={() => {
                  setGids('-1');
                  localStorage.setItem(localeKey, '-1');
                  // TODO: 选择预置条件时清理掉业务组的 ids 和 isLeaf 参数
                  history.push({
                    pathname: location.pathname,
                    search: queryString.stringify({
                      ..._.omit(query, ['ids', 'isLeaf']),
                    }),
                  });
                }}
              >
                {publicOptionLabel}
              </div>
            )}
            <div
              className={classNames({
                'n9e-biz-group-item': true,
                active: gids === '-2',
              })}
              onClick={() => {
                setGids('-2');
                localStorage.setItem(localeKey, '-2');
                // TODO: 选择预置条件时清理掉业务组的 ids 和 isLeaf 参数
                history.push({
                  pathname: location.pathname,
                  search: queryString.stringify({
                    ..._.omit(query, ['ids', 'isLeaf']),
                  }),
                });
              }}
            >
              <Space>
                {allOptionLabel || t('default_filter.all')}
                {allOptionTooltip && (
                  <Tooltip title={allOptionTooltip}>
                    <InfoCircleOutlined />
                  </Tooltip>
                )}
              </Space>
            </div>
          </div>
        );
      }}
      showSelected={gids !== '-1' && gids !== '-2'}
      onSelect={(key) => {
        const ids = getCleanBusinessGroupIds(key);
        setGids(ids);
        localStorage.removeItem(localeKey);
      }}
    />
  );
}
