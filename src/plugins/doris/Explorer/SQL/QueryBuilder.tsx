import React, { useContext } from 'react';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { Form, Space, Tooltip } from 'antd';

import { CommonStateContext } from '@/App';
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
  const { logsDefaultRange } = useContext(CommonStateContext);
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
        <Tooltip
          overlayClassName='ant-tooltip-with-link'
          title={
            <Trans
              ns={NAME_SPACE}
              i18nKey='query.time_field_tip'
              components={{
                br: <br />,
                a: <a target='__blank' href='/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/#%E6%97%B6%E9%97%B4%E5%AE%8F' />,
              }}
            />
          }
        >
          <Form.Item name={['query', 'range']} initialValue={logsDefaultRange}>
            <TimeRangePicker />
          </Form.Item>
        </Tooltip>
        {extra}
      </div>
    </div>
  );
}
