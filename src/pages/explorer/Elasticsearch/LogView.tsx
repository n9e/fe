import React, { useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Space, Table, Tabs } from 'antd';
import { QuestionOutlined, CopyOutlined } from '@ant-design/icons';
import purify from 'dompurify';
import moment from 'moment';

import { copyToClipBoard } from '@/utils';
import RenderValue from '@/pages/explorer/components/RenderValue';
import { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';

import HighLightJSON from './HighLightJSON';
import { Field, getFieldLabel } from './utils';
import { getHighlightHtml } from './utils/highlight';
import { typeIconMap } from './FieldsSidebar/Field';
import { typeMap } from '../Elasticsearch/services';

interface Props {
  value: Record<string, any>;
  fieldConfig?: FieldConfigVersion2;
  fields: Field[];
  highlight: any;
  range: IRawTimeRange;
  onActionClick?: (params: { key: string; value?: string; operator: string }) => void;
}

export default function LogView(props: Props) {
  const { t } = useTranslation('explorer');
  const { value, fieldConfig, fields, highlight, range, onActionClick } = props;

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
                return (
                  <RenderValue
                    fieldKey={field}
                    fieldValue={val}
                    fieldConfig={fieldConfig}
                    rawValue={value}
                    range={range}
                    adjustFieldValue={(formatedValue) => {
                      if (highlight?.[field]) {
                        return <span dangerouslySetInnerHTML={{ __html: purify.sanitize(getHighlightHtml(formatedValue, highlight[field])) }} />;
                      }
                      return formatedValue;
                    }}
                    onActionClick={onActionClick}
                  />
                );
              },
            },
          ]}
          size='small'
          pagination={false}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab='JSON' key='json'>
        <HighLightJSON value={value} query={{ start, end }} urlTemplates={fieldConfig?.linkArr} extractArr={fieldConfig?.regExtractArr} />
      </Tabs.TabPane>
    </Tabs>
  );
}
