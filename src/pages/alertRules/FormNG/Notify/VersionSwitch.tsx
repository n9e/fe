import React, { useContext } from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { V8_BETA_14_TS } from '@/utils/constant';

interface ContentProps {
  value?: number;
  onChange?: (value: number) => void;
}

function Content(props: ContentProps) {
  const { t } = useTranslation('alertRules');
  const { installTs } = useContext(CommonStateContext);
  const { value, onChange } = props;

  if (installTs > V8_BETA_14_TS) {
    return null; // Hide the switch if installed after the specified timestamp
  }

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
