import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Space, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
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

export function getDefaultGids(localeKey: string, businessGroup: any) {
  return localStorage.getItem(localeKey) || businessGroup.ids || '-2';
}

export default function BusinessGroupSideBarWithAll(props: Props) {
  const { t } = useTranslation('BusinessGroup');
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
