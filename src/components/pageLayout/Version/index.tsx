import React, { useState, useEffect } from 'react';
import semver from 'semver';
import { Badge, Tooltip } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import { getVersions, Versions } from './services';
import './locale';
// @ts-ignore
import useIsPlus from 'plus:/components/useIsPlus';

export default function Version() {
  const { t } = useTranslation('headerVersion');
  const isPlus = useIsPlus();
  const [versions, setVersions] = useState<Versions>();
  const [badgeShow, setBadgeShow] = useState(false);

  useEffect(() => {
    if (!isPlus) {
      getVersions().then((res) => {
        setVersions(res);
        if (semver.valid(res.version) && semver.valid(res.github_verison) && semver.gt(res.github_verison, res.version)) {
          setBadgeShow(true);
        }
      });
    }
  }, []);

  if (!isPlus) {
    return (
      <div style={{ marginRight: 16 }}>
        <Tooltip
          title={
            badgeShow ? (
              <Trans
                ns='headerVersion'
                i18nKey='newVersion'
                values={{
                  version: versions?.github_verison,
                }}
                components={{ a: <a style={{ color: '#b7a6e5' }} href='https://github.com/ccfos/nightingale/releases' target='_blank' /> }}
              />
            ) : undefined
          }
        >
          <Badge dot={badgeShow}>
            <span
              style={{
                cursor: badgeShow ? 'pointer' : 'default',
              }}
            >
              {versions?.version}
            </span>
          </Badge>
        </Tooltip>
      </div>
    );
  }
  return null;
}
