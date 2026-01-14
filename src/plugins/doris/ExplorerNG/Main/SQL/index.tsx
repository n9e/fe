import React, { useRef } from 'react';
import { Form } from 'antd';
import { useSize } from 'ahooks';

import Table from './Table';
import Timeseries from './Timeseries';

interface Props {
  tableSelector: {
    antd: string;
    rgd: string;
  };
  setExecuteLoading: (loading: boolean) => void;
}

export default function index(props: Props) {
  const { tableSelector, setExecuteLoading } = props;

  const sqlVizType = Form.useWatch(['query', 'sqlVizType']);
  const timeSeriesEleRef = useRef<HTMLDivElement>(null);
  const timeSeriesEleSize = useSize(timeSeriesEleRef);

  return (
    <>
      <Form.Item name={['query', 'sqlVizType']} initialValue='table' hidden>
        <div />
      </Form.Item>
      {sqlVizType === 'table' && <Table tableSelector={tableSelector} setExecuteLoading={setExecuteLoading} sqlVizType={sqlVizType} />}
      {sqlVizType === 'timeseries' && (
        <div ref={timeSeriesEleRef} className='w-full h-full min-h-0 flex flex-col'>
          {timeSeriesEleSize?.width && <Timeseries width={timeSeriesEleSize.width} setExecuteLoading={setExecuteLoading} sqlVizType={sqlVizType} />}
        </div>
      )}
    </>
  );
}
