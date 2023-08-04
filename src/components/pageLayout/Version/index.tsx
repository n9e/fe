import React, { useContext } from 'react';
import { Badge, Tooltip } from 'antd';
import { Trans } from 'react-i18next';
import { CommonStateContext } from '@/App';
// @ts-ignore
import useIsPlus from 'plus:/components/useIsPlus';
import './locale';
export interface Versions {
  github_verison: string;
  version: string;
}

export default function Version() {
  const isPlus = useIsPlus();
  const { versions } = useContext(CommonStateContext);

  if (!isPlus) {
    return (
      <div style={{ marginRight: 16 }}>
        <Tooltip
          title={
            versions.newVersion ? (
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
          <Badge dot={versions.newVersion}>
            <span
              style={{
                cursor: versions.newVersion ? 'pointer' : 'default',
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
