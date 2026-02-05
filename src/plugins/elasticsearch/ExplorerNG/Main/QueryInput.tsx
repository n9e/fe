import React from 'react';
import { Space, Form, Input } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import KQLInput from '@/components/KQLInput';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../../constants';
import QueryInputAddonAfter from '../components/QueryInputAddonAfter';

interface Props {
  snapRangeRef: React.MutableRefObject<{
    from?: number;
    to?: number;
  }>;
  executeQuery: () => void;
}

export default function QueryInputCpt(props: Props) {
  const { t } = useTranslation(NAME_SPACE);

  const { snapRangeRef, executeQuery } = props;

  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch(['query']);

  if (!datasourceValue) return null;

  return (
    <InputGroupWithFormItem
      label={
        <Space>
          {t(`${logExplorerNS}:query`)}
          <a
            href={
              queryValues?.syntax === 'lucene'
                ? 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax'
                : 'https://www.elastic.co/guide/en/kibana/current/kuery-query.html'
            }
            target='_blank'
          >
            <QuestionCircleOutlined />
          </a>
        </Space>
      }
      addonAfter={<QueryInputAddonAfter executeQuery={executeQuery} />}
    >
      <div className='relative'>
        {queryValues?.syntax === 'lucene' ? (
          <Form.Item name={['query', 'query']}>
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 6 }}
              onPressEnter={() => {
                snapRangeRef.current = {
                  from: undefined,
                  to: undefined,
                };
                executeQuery();
              }}
            />
          </Form.Item>
        ) : (
          <Form.Item name={['query', 'query']}>
            <KQLInput
              datasourceValue={datasourceValue}
              query={{
                index: queryValues?.index,
                date_field: queryValues?.date_field,
              }}
              historicalRecords={[]}
              onEnter={() => {
                snapRangeRef.current = {
                  from: undefined,
                  to: undefined,
                };
                executeQuery();
              }}
            />
          </Form.Item>
        )}
      </div>
    </InputGroupWithFormItem>
  );
}
