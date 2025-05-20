import React, { useEffect } from 'react';
import { Form, AutoComplete } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NS } from '../../constants';
import { getItemsIdents } from '../../services';

export default function IdentsSelect() {
  const { t } = useTranslation(NS);
  const [idents, setIdents] = React.useState<string[]>([]);

  useEffect(() => {
    getItemsIdents().then((data) => {
      setIdents(data);
    });
  }, []);

  return (
    <Form.Item label={t('ident')} tooltip={t('ident_tip')} name='ident' rules={[{ required: true }]}>
      <AutoComplete
        options={_.map(idents, (item) => {
          return { value: item };
        })}
      />
    </Form.Item>
  );
}
