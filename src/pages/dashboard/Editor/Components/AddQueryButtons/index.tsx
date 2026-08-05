import React from 'react';
import { Button, Space, Form } from 'antd';
import type { FormListOperation } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { IS_PLUS } from '@/utils/constant';

import getFirstUnusedLetter from '../../../Renderer/utils/getFirstUnusedLetter';

interface AddQueryButtonsProps {
  add: FormListOperation['add'];
  addQuery: (refId: string) => void;
}

export default function index({ add, addQuery }: AddQueryButtonsProps) {
  const { t } = useTranslation('dashboard');
  const targets = Form.useWatch('targets');
  const newRefId = getFirstUnusedLetter(_.map(targets, 'refId'));

  return (
    <Space style={{ marginTop: 10 }}>
      <Button
        onClick={() => {
          addQuery(newRefId);
        }}
      >
        + {t('query.add_query_btn')}
      </Button>
      {IS_PLUS && (
        <Button
          onClick={() => {
            add({ kind: 'expression', expression: '', refId: newRefId });
          }}
        >
          + {t('query.add_expression_btn')}
        </Button>
      )}
    </Space>
  );
}
