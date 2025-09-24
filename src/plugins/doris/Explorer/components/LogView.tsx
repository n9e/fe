import React, { useState, useMemo } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Space, Table, Tabs, Form } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { copyToClipBoard } from '@/utils';
import HighLightJSON from '@/pages/explorer/Elasticsearch/HighLightJSON';
import { FieldValueWithFilter } from './RawList';
import moment from 'moment';

interface Props {
  value: Record<string, any>;
  onValueFilter?: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
  fieldConfig?: FieldConfigVersion2;
  rawValue?: object;
}

export default function LogView(props: Props) {
  const { t } = useTranslation('explorer');
  const { value, onValueFilter, fieldConfig, rawValue } = props;
  const [type, setType] = useState<string>('table');
  const form = Form.useFormInstance();
  const range = form.getFieldValue(['query', 'range']);
  const parsedRange = range ? parseRange(range) : null;
  let start = parsedRange ? moment(parsedRange.start).unix() : 0;
  let end = parsedRange ? moment(parsedRange.end).unix() : 0;
  const data = useMemo(
    () =>
      _.map(_.omit(value, ['___id___', '___raw___']), (val, key) => {
        return {
          field: key,
          value: val,
        };
      }),
    [],
  );
  let jsonValue = '';
  try {
    jsonValue = JSON.stringify(value.___raw___, null, 4);
  } catch (e) {
    console.error(e);
    jsonValue = '无法解析';
  }

  return (
    <Tabs
      activeKey={type}
      onChange={(val) => {
        setType(val);
      }}
      size='small'
      // className='log-view-tabs'
      tabBarExtraContent={
        <Space
          onClick={() => {
            copyToClipBoard(jsonValue);
          }}
          style={{ cursor: 'pointer' }}
        >
          <CopyOutlined />
          {t('log.copyToClipboard')}
        </Space>
      }
    >
      <Tabs.TabPane tab='Table' key='table'>
        <Table
          showHeader={false}
          rowKey='field'
          dataSource={data}
          columns={[
            {
              title: 'Field',
              dataIndex: 'field',
              key: 'field',
            },
            {
              title: 'Value',
              dataIndex: 'value',
              key: 'value',
              render: (val, record) => {
                return <FieldValueWithFilter name={record.field} value={val} onValueFilter={onValueFilter} fieldConfig={fieldConfig} rawValue={rawValue} />;
              },
            },
          ]}
          size='small'
          pagination={false}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab='JSON' key='json'>
        <HighLightJSON value={value.___raw___} query={{ start, end }} urlTemplates={fieldConfig?.linkArr} extractArr={fieldConfig?.regExtractArr} />
      </Tabs.TabPane>
    </Tabs>
  );
}
