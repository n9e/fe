import React from 'react';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';

import { NS } from '../constants';
import { postItem } from '../services';
import Form from './Form';
import { normalizeFormValues } from '../utils/normalizeValues';

interface Props {
  initialValues?: any;
  onOk: () => void;
  onCancel: () => void;
}

export default function Add({ initialValues, onOk, onCancel }: Props) {
  const { t } = useTranslation(NS);

  return (
    <>
      <Form
        initialValues={initialValues}
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
