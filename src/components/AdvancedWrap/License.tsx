import React, { useContext } from 'react';
import { Tooltip, Modal } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { getBrainLicense } from '@/services/warning';
import { CommonStateContext } from '@/App';
import './locale';

export async function getLicense(t) {
  if (import.meta.env.VITE_IS_DS_SETTING === 'true' || import.meta.env.VITE_IS_COMMON_DS === 'true') {
    const now = moment().unix();
    const result = await getBrainLicense().catch((e) => {
      const modal = Modal.error({ closable: false, maskClosable: false, title: t('advancedWrap:licenseExpired_tips'), className: 'license-off' });
      setTimeout(() => {
        modal.destroy();
      }, 10000);
      // 如果接口报错，就认为是license过期了
      return Promise.resolve({
        data: {
          rules_remaining: 0,
          expire: now,
        },
      });
    });
    return Promise.resolve({
      licenseRulesRemaining: result?.data?.rules_remaining as number,
      licenseExpireDays: _.round((result?.data?.expire - now) / 86400),
    });
  }
  return Promise.resolve({
    licenseRulesRemaining: undefined,
    licenseExpireDays: undefined,
  });
}

export default function License() {
  const { t } = useTranslation('advancedWrap');
  const { licenseRulesRemaining, licenseExpireDays } = useContext(CommonStateContext);
  if (licenseExpireDays === undefined || licenseExpireDays > 30) return null;

  return (
    <div style={{ marginRight: 20 }}>
      <Tooltip
        title={
          <div>
            <div>
              {t('licenseExpireDays', {
                licenseExpireDays,
              })}
            </div>
            {licenseRulesRemaining && licenseRulesRemaining > 0 ? (
              <div>
                {t('licenseRulesRemaining', {
                  licenseRulesRemaining,
                })}
              </div>
            ) : (
              <div>{t('licenseRulesRemaining_0')}</div>
            )}
          </div>
        }
      >
        <div
          style={{
            background: '#EBE8F2',
            borderRadius: 16,
            color: '#6C53B1',
            fontSize: 12,
            padding: '2px 8px',
          }}
        >
          {t('licenseExpireDays', {
            licenseExpireDays,
          })}
        </div>
      </Tooltip>
    </div>
  );
}
