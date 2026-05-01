import React from 'react';
import _ from 'lodash';
import { Input, Form, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form/Form';
import { useTranslation } from 'react-i18next';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker from '@/components/TimeRangePicker';
import SqlTemplates from '../components/SqlTemplates';

interface Props {
  form: FormInstance;
  datasourceCate?: string;
  extra?: React.ReactNode;
  setRefreshFlag: (flag?: string) => void;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation('db_iotdb');
  const { form, extra, setRefreshFlag } = props;

  return (
    <div style={{ width: '100%' }}>
      <div className='iotdb-discover-query'>
        <InputGroupWithFormItem
          label={
            <span>
              {t('query.query')}{' '}
              <Tooltip
                title={
                  <span>
                    {t('query.query_tip1')}
                    <a target='_blank' href='https://iotdb.apache.org/UserGuide/latest-Table/API/SQL-Manual.html'>
                      {t('query.query_tip2')}
                    </a>
                  </span>
                }
              >
                <InfoCircleOutlined />
              </Tooltip>
            </span>
          }
        >
          <Form.Item name={['query', 'query']}>
            <Input
              onPressEnter={() => {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }}
            />
          </Form.Item>
        </InputGroupWithFormItem>
        <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
          <TimeRangePicker />
        </Form.Item>
        <SqlTemplates
          onSelect={(sql) => {
            const currentQuery = form.getFieldValue(['query']) || {};
            form.setFieldsValue({
              query: {
                ...currentQuery,
                query: sql,
              },
            });
          }}
        />
        {extra}
      </div>
    </div>
  );
}
