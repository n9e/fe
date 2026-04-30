import React from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '../../../constants';

import Table from './Table';
import Timeseries from './Timeseries';

import './style.less';

interface Props {
  tableSelector: {
    antd: string;
    rgd: string;
  };
  setExecuteLoading: (loading: boolean) => void;
  executeQuery: () => void;
  timeseriesKeys: {
    value: string[];
    label: string[];
  };
}

export default function index(props: Props) {
  const { tableSelector, setExecuteLoading, executeQuery, timeseriesKeys } = props;

  const sqlVizType = Form.useWatch(['query', 'sqlVizType']);

  return (
    <>
      <Form.Item name={['query', 'sqlVizType']} initialValue='table' hidden>
        <div />
      </Form.Item>
      {sqlVizType === 'table' && <Table tableSelector={tableSelector} setExecuteLoading={setExecuteLoading} sqlVizType={sqlVizType} executeQuery={executeQuery} />}
      {sqlVizType === 'timeseries' && <Timeseries setExecuteLoading={setExecuteLoading} />}
    </>
  );
}
