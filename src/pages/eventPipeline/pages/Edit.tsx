import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spin, message } from 'antd';
import _ from 'lodash';

import { NS } from '../constants';
import { Item, getItem, putItem } from '../services';
import Form from './Form';
import { normalizeFormValues, normalizeInitialValues, omitDerivedFields } from '../utils/normalizeValues';

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
            // 后端 PUT 为全字段覆盖，而表单只回传已注册字段。这里以拉取到的完整对象为底，
            // 用表单值覆盖，避免 group_id / use_case / trigger_mode / inputs 等表单未托管的字段被清零；
            // nodes / connections 是后端派生的，必须剔除，否则会覆盖执行时真正生效的配置。
            putItem({ ...omitDerivedFields(data), ...normalizeFormValues(values) }).then(() => {
              message.success(t('common:success.edit'));
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
