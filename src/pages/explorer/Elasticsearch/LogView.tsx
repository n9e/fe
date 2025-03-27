import React, { useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Space, Table, Tabs } from 'antd';
import { QuestionOutlined, CopyOutlined } from '@ant-design/icons';
import { EditorView } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { copyToClipBoard } from '@/utils';
import HighLightJSON from './HighLightJSON';
import { Field, getFieldLabel, getFieldValue, RenderValue } from './utils';
import { typeIconMap } from './FieldsSidebar/Field';
import { typeMap } from '../Elasticsearch/services';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import moment from 'moment';
interface Props {
  value: Record<string, any>;
  fieldConfig: any;
  fields: Field[];
  highlight: any;
  range: IRawTimeRange;
}

export default function LogView(props: Props) {
  const { t } = useTranslation('explorer');
  const { value, fieldConfig, fields, highlight, range } = props;

  const allParamsArr = fieldConfig?.formatMap
    ? Object.keys(fieldConfig.formatMap).reduce((prev, cur) => {
        return fieldConfig.formatMap[cur].paramsArr?.length > 0 ? [...prev, ...fieldConfig.formatMap[cur].paramsArr] : [];
      }, [])
    : [];

  const [type, setType] = useState<string>('table');
  const parsedRange = range ? parseRange(range) : null;
  let start = parsedRange ? moment(parsedRange.start).unix() : 0;
  let end = parsedRange ? moment(parsedRange.end).unix() : 0;
  let jsonValue = '';
  try {
    jsonValue = JSON.stringify(value, null, 4);
  } catch (e) {
    console.error(e);
    jsonValue = '无法解析';
  }

  const dataSource = _.filter(
    _.map(value, (val, key) => {
      return {
        field: key,
        value: val,
      };
    }),
    (item) => {
      return item.value !== undefined && item.value !== null && item.value !== '';
    },
  );
  return (
    <Tabs
      activeKey={type}
      onChange={(val) => {
        setType(val);
      }}
      size='small'
      className='log-view-tabs'
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
          dataSource={dataSource}
          columns={[
            {
              title: 'Field',
              dataIndex: 'field',
              key: 'field',
              render: (text: string) => {
                const finded = _.find(fields, { name: text });
                return (
                  <Space>
                    <span className='n9e-es-discover-fields-item-icon'>{finded ? typeIconMap[typeMap[finded.type]] || <QuestionOutlined /> : <QuestionOutlined />}</span>
                    {getFieldLabel(text, fieldConfig)}
                  </Space>
                );
              },
            },
            {
              title: 'Value',
              dataIndex: 'value',
              key: 'value',
              render: (val: any, record: { field: string }) => {
                const field = record.field;
                const fieldVal = getFieldValue(field, val, fieldConfig, value, range);
                const v = _.isArray(fieldVal) ? _.join(fieldVal, ',') : fieldVal;
                return (
                  <div>
                    <RenderValue value={v} highlights={highlight?.[field]} />
                  </div>
                );
              },
            },
          ]}
          size='small'
          pagination={false}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab='JSON' key='json'>
        <HighLightJSON value={value} query={{ start, end }} features={allParamsArr} />
      </Tabs.TabPane>
    </Tabs>
  );
}
