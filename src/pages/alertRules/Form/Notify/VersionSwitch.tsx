import React from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';

interface ContentProps {
  value?: number;
  onChange?: (value: number) => void;
}

function Content(props: ContentProps) {
  const { t } = useTranslation('alertRules');
  const { value, onChange } = props;

  return (
    <a
      onClick={() => {
        if (onChange) {
          onChange(value === 1 ? 0 : 1);
        }
      }}
    >
      {value === 1 ? t('switch_to_old') : t('switch_to_new')}
    </a>
  );
}

export default function VersionSwitch() {
  return (
    <Form.Item name='notify_version' noStyle>
      <Content />
    </Form.Item>
  );
}
