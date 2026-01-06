import React from 'react';
import { Form } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';
import _ from 'lodash';

import HistoricalRecords from '@/components/HistoricalRecords';

import { SQL_CACHE_KEY } from '../../../constants';

interface Props {
  executeQuery: () => void;
}

export default function QueryInputAddonAfter(props: Props) {
  const { executeQuery } = props;
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue');

  if (!datasourceValue) return null;

  return (
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
      type='text'
    >
      <FileSearchOutlined />
    </HistoricalRecords>
  );
}
