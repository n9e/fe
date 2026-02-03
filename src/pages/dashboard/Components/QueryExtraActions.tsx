import React from 'react';
import { Space, Tooltip, Form } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { CopyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import getFirstUnusedLetter from '../Renderer/utils/getFirstUnusedLetter';

import HideButton from './HideButton';

interface Props {
  field: FormListFieldData;
  add: (defaultValue?: any, insertIndex?: number) => void;
}

export default function QueryExtraActions({ field, add }: Props) {
  const { t } = useTranslation('dashboard');
  const targets = Form.useWatch('targets');

  return (
    <Space>
      <Tooltip placement='top' title={t('query.copy_query')}>
        <CopyOutlined
          onClick={() => {
            const currentTarget = _.get(targets, field.name);
            if (currentTarget) {
              const newRefId = getFirstUnusedLetter(_.map(targets, 'refId'));
              add({ ...currentTarget, refId: newRefId }, targets.length);
            }
          }}
        />
      </Tooltip>
      <Form.Item noStyle {...field} name={[field.name, 'hide']}>
        <HideButton />
      </Form.Item>
    </Space>
  );
}
