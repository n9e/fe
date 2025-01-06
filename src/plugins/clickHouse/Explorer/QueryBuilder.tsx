import React, { useContext } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Form, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import LogQL from '@/components/LogQL';
import { DatasourceCateEnum } from '@/utils/constant';
import DocumentDrawer from '../components/DocumentDrawer';
import HistoricalRecords from '../components/HistoricalRecords';
import { CACHE_KEY, NAME_SPACE } from '../constants';
import { useGlobalState } from '../globalState';

interface Props {
  extra?: React.ReactNode;
  executeQuery: () => void;
  datasourceValue: number;
  getMode: () => string;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const [mySQLTableFields, setMySQLTableFields] = useGlobalState('mySQLTableFields');
  const form = Form.useFormInstance();
  const { extra, executeQuery, datasourceValue, getMode } = props;
  const { darkMode } = useContext(CommonStateContext);

  return (
    <div style={{ width: '100%' }}>
      <div className='explorer-query'>
        <InputGroupWithFormItem
          label={
            <Space>
              {t('query.query')}
              <InfoCircleOutlined
                onClick={() => {
                  DocumentDrawer({
                    darkMode,
                  });
                }}
              />
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
              datasourceCate={DatasourceCateEnum.ck}
              datasourceValue={datasourceValue}
              query={{}}
              historicalRecords={[]}
              onPressEnter={executeQuery}
              onChange={() => {
                // 在 graph 视图里 sql 修改后清空缓存的 fields
                if (getMode() === 'graph') {
                  setMySQLTableFields([]);
                }
              }}
              placeholder={t('query.query_placeholder')}
            />
          </Form.Item>
        </InputGroupWithFormItem>
        <HistoricalRecords
          localKey={CACHE_KEY}
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
