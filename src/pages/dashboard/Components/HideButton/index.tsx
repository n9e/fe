import React from 'react';
import { Tooltip } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface Props {
  value?: boolean;
  onChange?: (value?: boolean) => void;
}

export default function index(props: Props) {
  const { t } = useTranslation('dashboard');
  const { value, onChange } = props;

  if (value === true) {
    return (
      <Tooltip placement='top' title={t('query.hide_response')}>
        <EyeInvisibleOutlined
          onClick={() => {
            onChange && onChange(false);
          }}
        />
      </Tooltip>
    );
  }
  return (
    <Tooltip placement='top' title={t('query.hide_response')}>
      <EyeOutlined
        onClick={() => {
          onChange && onChange(true);
        }}
      />
    </Tooltip>
  );
}
