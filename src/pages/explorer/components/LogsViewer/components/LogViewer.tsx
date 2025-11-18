/**
 * 单行日志的展示组件
 * 用于 Raw 组件中展开单行日志的展示
 */

import React, { useState, useMemo, useContext } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Space, Table, Tabs } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import moment from 'moment';

import { copyToClipBoard } from '@/utils';
import { parseRange } from '@/components/TimeRangePicker';

import FieldValueWithFilter from './FieldValueWithFilter';
import { LogsViewerStateContext } from '../index';
import HighLightJSON from './HighLightJSON';

interface Props {
  value: Record<string, any>;
  onValueFilter?: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
  rawValue?: object;
}

export default function LogView(props: Props) {
  const { t } = useTranslation('explorer');
  const { fieldConfig, range } = useContext(LogsViewerStateContext);
  const { value, onValueFilter, rawValue } = props;
  const [type, setType] = useState<string>('table');
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
    console.warn(e);
    jsonValue = '无法解析';
  }

  return (
    <Tabs
      activeKey={type}
      onChange={(val) => {
        setType(val);
      }}
      size='small'
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
                return <FieldValueWithFilter name={record.field} value={val} onValueFilter={onValueFilter} rawValue={rawValue} />;
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
