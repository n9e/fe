import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tooltip, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

interface Props {
  onReload: () => void;
}

export default function IndexPatternSettingsBtn(props: Props) {
  const { t } = useTranslation('explorer');
  const { onReload } = props;

  return (
    <Tooltip
      overlayClassName='ant-tooltip-with-link'
      title={
        <Space>
          {t('datasource:es.indexPatterns_manage')}
          <a onClick={onReload}>{t('common:btn.reload')}</a>
        </Space>
      }
    >
      <Link to='/log/index-patterns' target='_blank'>
        <SettingOutlined />
      </Link>
    </Tooltip>
  );
}
