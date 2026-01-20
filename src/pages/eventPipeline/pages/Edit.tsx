import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spin, message } from 'antd';
import _ from 'lodash';

import { NS } from '../constants';
import { Item, getItem, putItem } from '../services';
import Form from './Form';
import { normalizeFormValues, normalizeInitialValues } from '../utils/normalizeValues';

interface Props {
  id: number;
  onOk?: () => void;
  onCancel?: () => void;
}

export default function Edit({ id, onOk, onCancel }: Props) {
  const { t } = useTranslation(NS);
  const [data, setData] = useState<Item>();

  useEffect(() => {
    if (id) {
      getItem(_.toNumber(id)).then((res) => {
        setData(normalizeInitialValues(res));
      });
    }
  }, []);

  return (
    <>
      {data ? (
        <Form
          initialValues={data}
          onOk={(values) => {
            putItem(normalizeFormValues(values)).then(() => {
              message.success(t('common:success.add'));
              onOk?.();
            });
          }}
          onCancel={onCancel}
        />
      ) : (
        <div>
          <Spin spinning />
        </div>
      )}
    </>
  );
}
