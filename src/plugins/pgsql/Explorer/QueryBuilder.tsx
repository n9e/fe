import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Form, Space } from 'antd';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker from '@/components/TimeRangePicker';
import LogQL from '@/components/LogQL';
import HistoricalRecords from '@/components/HistoricalRecords';

import { NAME_SPACE, HISTORY_RECORDS_CACHE_KEY, QUERY_KEY } from '../constants';
import { useGlobalState } from '../globalState';

interface Props {
  extra?: React.ReactNode;
  executeQuery: () => void;
  datasourceValue: number;
  getMode: () => string;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const [tableFields, setTableFields] = useGlobalState('tableFields');
  const form = Form.useFormInstance();
  const { extra, executeQuery, datasourceValue, getMode } = props;

  return (
    <div style={{ width: '100%' }}>
      <div className='explorer-query'>
        <InputGroupWithFormItem label={<Space>{t('query.query')}</Space>}>
          <Form.Item
            name={['query', QUERY_KEY]}
            rules={[
              {
                required: true,
                message: t('query.query_required'),
              },
            ]}
          >
            <LogQL
              datasourceCate={NAME_SPACE}
              datasourceValue={datasourceValue}
              query={{}}
              historicalRecords={[]}
              onPressEnter={executeQuery}
              onChange={() => {
                // 在 graph 视图里 sql 修改后清空缓存的 fields
                if (getMode() === 'graph') {
                  setTableFields([]);
                }
              }}
              placeholder={t('query.query_placeholder')}
            />
          </Form.Item>
        </InputGroupWithFormItem>
        <HistoricalRecords
          localKey={HISTORY_RECORDS_CACHE_KEY}
          datasourceValue={datasourceValue}
          onSelect={(sql) => {
            form.setFieldsValue({
              query: {
                [QUERY_KEY]: sql,
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
