import React from 'react';
import _ from 'lodash';
import { Button, Form } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';

import ConditionHistoricalRecords from '@/components/HistoricalRecords/ConditionHistoricalRecords';

import { QUERY_CACHE_KEY } from '../constants';

interface Props {
  executeQuery: () => void;
}

function getModeLabel(mode?: string) {
  if (mode === 'metric') return '时序数据';
  return '日志原文';
}

export default function QueryInputAddonAfter(props: Props) {
  const { executeQuery } = props;
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue');
  const mode = Form.useWatch(['query', 'mode']) || 'raw';

  if (!datasourceValue) return null;

  return (
    <ConditionHistoricalRecords
      localKey={`${QUERY_CACHE_KEY}-${mode}`}
      datasourceValue={datasourceValue}
      renderItem={(item, setVisible) => {
        return (
          <div
            className='flex flex-wrap items-center gap-y-1 cursor-pointer hover:bg-[var(--fc-fill-3)] p-1 rounded leading-[1.1] mb-1'
            key={JSON.stringify(item)}
            onClick={() => {
              const query = form.getFieldValue('query') || {};
              form.setFieldsValue({
                refreshFlag: undefined,
                query: {
                  ...query,
                  mode: _.toString(item.mode || mode),
                  query: _.toString(item.query || ''),
                  querySource: 'code',
                  builderStatus: 'stale',
                },
              });
              executeQuery();
              setVisible(false);
            }}
          >
            <span className='whitespace-nowrap'>
              <span className='bg-[var(--fc-fill-1)] inline-block p-1 mr-1'>模式:</span>
              <span className='pr-1'>{getModeLabel(_.toString(item.mode || mode))}</span>
            </span>
            <span className='whitespace-nowrap'>
              <span className='bg-[var(--fc-fill-1)] inline-block p-1 mr-1'>查询条件:</span>
              <span className='pr-1'>{_.toString(item.query || '')}</span>
            </span>
          </div>
        );
      }}
      type='text'
    >
      <Button size='small' type='text' icon={<FileSearchOutlined />} />
    </ConditionHistoricalRecords>
  );
}
