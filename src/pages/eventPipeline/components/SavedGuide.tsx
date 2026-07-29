import React from 'react';
import { Button, Result, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { NS } from '../constants';

interface Props {
  /** 完成：关闭抽屉并刷新列表 */
  onDone?: () => void;
}

/**
 * 保存成功后的接力面板：工作流本身不生效，必须被告警/通知规则引用。
 * 这里明确告知并给出跳转入口（轻量版，不做深度预填）。
 */
export default function SavedGuide({ onDone }: Props) {
  const { t } = useTranslation(NS);
  const history = useHistory();

  return (
    <Result
      status='success'
      title={t('saved_guide.title')}
      subTitle={t('saved_guide.hint')}
      extra={
        <Space>
          <Button type='primary' onClick={() => history.push('/alert-rules')}>
            {t('saved_guide.to_alert_rule')}
          </Button>
          <Button onClick={() => history.push('/notification-rules')}>{t('saved_guide.to_notify_rule')}</Button>
          <Button type='link' onClick={onDone}>
            {t('saved_guide.done')}
          </Button>
        </Space>
      }
    />
  );
}
