import React from 'react';
import { Form, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import RelabelItem from './RelabelItem';
import TestModal from './TestModal';
import './style.less';

export const name = ['rule_config', 'event_relabel_config'];

export default function PrometheusV2() {
  const { t } = useTranslation('alertRules');

  return (
    <>
      <Form.List name={name}>
        {(fields, { add, remove, move }) => (
          <div className='n9e-alert-relabel-list'>
            {fields.map((field, idx) => (
              <RelabelItem key={field.key} prefixName={name} field={field} remove={remove} move={move} add={add} fields={fields} idx={idx} />
            ))}
            <Button
              type='dashed'
              onClick={() =>
                add({
                  action: 'replace',
                })
              }
              style={{ width: '100%' }}
              icon={<PlusOutlined />}
            >
              {t('common:btn.add')}
            </Button>
          </div>
        )}
      </Form.List>
      <TestModal />
    </>
  );
}
