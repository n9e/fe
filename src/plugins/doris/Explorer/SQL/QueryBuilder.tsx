import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Form, Space } from 'antd';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker from '@/components/TimeRangePicker';
import LogQL from '@/components/LogQL';
import { DatasourceCateEnum } from '@/utils/constant';
import HistoricalRecords from '@/components/HistoricalRecords';

import { SQL_CACHE_KEY, NAME_SPACE } from '../../constants';

interface Props {
  extra?: React.ReactNode;
  executeQuery: () => void;
  datasourceValue: number;
  labelInfo?: React.ReactNode;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const form = Form.useFormInstance();
  const { extra, executeQuery, datasourceValue, labelInfo } = props;

  return (
    <div style={{ width: '100%' }}>
      <div className='explorer-query'>
        <InputGroupWithFormItem
          label={
            <Space>
              {t('query.query')}
              {labelInfo}
            </Space>
          }
        >
          <Form.Item
            name={['query', 'query']}
            rules={[
              {
                required: true,
                message: t('query.query_required'),
              },
            ]}
          >
            <LogQL
              datasourceCate={DatasourceCateEnum.doris}
              datasourceValue={datasourceValue}
              query={{}}
              historicalRecords={[]}
              onPressEnter={executeQuery}
              placeholder='SELECT count(*) as count FROM db_name.table_name WHERE $__timeFilter(timestamp)'
            />
          </Form.Item>
        </InputGroupWithFormItem>
        <HistoricalRecords
          localKey={SQL_CACHE_KEY}
          datasourceValue={datasourceValue}
          onSelect={(query) => {
            form.setFieldsValue({
              query: {
                query,
              },
            });
            executeQuery();
          }}
        />
        <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
          <TimeRangePicker />
        </Form.Item>
        {extra}
      </div>
    </div>
  );
}
