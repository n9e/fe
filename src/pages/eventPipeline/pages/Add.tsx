import React from 'react';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';

import { NS } from '../constants';
import { postItem } from '../services';
import Form from './Form';
import { normalizeFormValues } from '../utils/normalizeValues';

interface Props {
  onOk: () => void;
  onCancel: () => void;
}

export default function Add({ onOk, onCancel }: Props) {
  const { t } = useTranslation(NS);

  return (
    <>
      <Form
        onOk={(values) => {
          postItem(normalizeFormValues(values)).then(() => {
            message.success(t('common:success.add'));
            onOk();
          });
        }}
        onCancel={onCancel}
      />
    </>
  );
}
