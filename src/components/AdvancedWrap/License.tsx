import React, { useEffect, useState } from 'react';
import { Tooltip, Modal } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { getBrainLicense } from '@/services/warning';

export default function License() {
  const [days, setDays] = useState<any>();
  const [rules, setRules] = useState<any>();
  useEffect(() => {
    const now = moment().unix();
    getBrainLicense()
      .then((res) => {
        setDays(_.round((res?.data?.expire - now) / 86400));
        setRules(res?.data?.rules_remaining);
        window.localStorage.setItem('license_rules_remaining', _.toString(res?.data?.rules_remaining));
      })
      .catch((e) => {
        const modal = Modal.error({ closable: false, maskClosable: false, title: 'License证书不存在或已过期，请联系Flashcat技术支持', className: 'license-off' });
        setTimeout(() => {
          modal.destroy();
        }, 10000);
      });
  }, []);
  if (!days || days > 30) return null;
  return (
    <div style={{ marginRight: 20 }}>
      <Tooltip
        title={
          <div>
            <div>还剩 {days} 天到期</div>
            {rules > 0 ? <div>还可添加 {rules} 条规则</div> : <div>请尽快联系管理员续费</div>}
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
          还剩 {days} 天到期
        </div>
      </Tooltip>
    </div>
  );
}
