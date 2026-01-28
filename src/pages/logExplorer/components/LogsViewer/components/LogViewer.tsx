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
import getTextWidth from '@/utils/getTextWidth';
import { parseRange } from '@/components/TimeRangePicker';

import { NAME_SPACE } from '../../../constants';
import { OnValueFilterParams } from '../types';
import { LogsViewerStateContext } from '../index';
import LogFieldValue from './LogFieldValue';
import HighLightJSON from './HighLightJSON';

interface Props {
  value: Record<string, any>;
  onValueFilter?: (parmas: OnValueFilterParams) => void;
  rawValue?: object;
  id_key: string;
  raw_key: string;
}

export default function LogView(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { fieldConfig, range } = useContext(LogsViewerStateContext);
  const { value, onValueFilter, rawValue, raw_key, id_key } = props;
  const [type, setType] = useState<string>('table');
  const parsedRange = range ? parseRange(range) : null;
  let start = parsedRange ? moment(parsedRange.start).unix() : 0;
  let end = parsedRange ? moment(parsedRange.end).unix() : 0;
  const data = useMemo(
    () =>
      _.map(_.omit(value, [id_key, raw_key]), (val, key) => {
        return {
          field: key,
          value: val,
        };
      }),
    [value],
  );

  const maxFieldLength = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map((item) => getTextWidth(item.field)));
  }, [data]);

  let jsonValue = '';
  try {
    jsonValue = JSON.stringify(value[raw_key], null, 4);
  } catch (e) {
    console.warn(e);
    jsonValue = '无法解析';
  }

  return (
    <Tabs
      className='flex flex-col n9e-log-explorer-log-viewer-tabs'
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
          {t('copy_to_clipboard')}
        </Space>
      }
    >
      <Tabs.TabPane tab='Table' key='table'>
        <div className='h-full overflow-auto'>
          <Table
            showHeader={false}
            rowKey='field'
            tableLayout='fixed'
            dataSource={data}
            columns={[
              {
                title: 'Field',
                dataIndex: 'field',
                key: 'field',
                width: maxFieldLength + 16 + 8, // 16px 是 padding，8px 容错
              },
              {
                title: 'Value',
                dataIndex: 'value',
                key: 'value',
                render: (val, record) => {
                  return <LogFieldValue enableTooltip name={record.field} value={val} onTokenClick={onValueFilter} rawValue={rawValue} fieldValueClassName='whitespace-pre-wrap' />;
                },
              },
            ]}
            size='small'
            pagination={false}
          />
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane tab='JSON' key='json'>
        <div className='h-full overflow-auto'>
          <HighLightJSON value={value[raw_key]} query={{ start, end }} urlTemplates={fieldConfig?.linkArr} extractArr={fieldConfig?.regExtractArr} />
        </div>
      </Tabs.TabPane>
    </Tabs>
  );
}
