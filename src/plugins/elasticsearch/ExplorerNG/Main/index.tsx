import React, { useState, useContext, useRef } from 'react';
import { Form, Row, Col, Button, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';
import TimeRangePicker from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../../constants';
import { Field, Interval } from '../types';
import MainMoreOperations from '../components/MainMoreOperations';
import { HandleValueFilterParams } from '../types';
import RawMain from './Raw';
import QueryQueryInput from './QueryInput';

interface Props {
  indexData: Field[];

  organizeFields: string[];
  setOrganizeFields: (value: string[]) => void;
  executeQuery: () => void;
  handleValueFilter: HandleValueFilterParams;

  interval?: Interval;
  setInterval: React.Dispatch<React.SetStateAction<Interval | undefined>>;
  intervalFixedRef: React.MutableRefObject<boolean>;

  rangeRef: React.MutableRefObject<
    | {
        from: number;
        to: number;
      }
    | undefined
  >;
  serviceParams: {
    current: number;
    pageSize: number;
    reverse: boolean;
    refreshFlag: string | undefined;
  };
  setServiceParams: React.Dispatch<
    React.SetStateAction<{
      current: number;
      pageSize: number;
      reverse: boolean;
      refreshFlag: string | undefined;
    }>
  >;
  getServiceParams: () => {
    current: number;
    pageSize: number;
    reverse: boolean;
    refreshFlag: string | undefined;
  };
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logsDefaultRange } = useContext(CommonStateContext);

  const {
    indexData,
    organizeFields,
    setOrganizeFields,
    executeQuery,
    handleValueFilter,
    interval,
    setInterval,
    intervalFixedRef,
    rangeRef,
    serviceParams,
    setServiceParams,
    getServiceParams,
  } = props;

  const [executeLoading, setExecuteLoading] = useState(false);

  const form = Form.useFormInstance();

  // 点击直方图某个柱子时，设置的时间范围
  const snapRangeRef = useRef<{
    from?: number;
    to?: number;
  }>({
    from: undefined,
    to: undefined,
  });

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-shrink-0 relative'>
        <Row gutter={SIZE} wrap={false}>
          <Col flex='none'>
            <Form.Item name={['query', 'syntax']} initialValue='kuery' noStyle>
              <Select
                options={[
                  {
                    label: t('query.syntax_kuery'),
                    value: 'kuery',
                  },
                  {
                    label: t('query.syntax_lucene'),
                    value: 'lucene',
                  },
                ]}
                onChange={() => {
                  form.setFieldsValue({
                    query: {
                      query: '',
                    },
                  });
                }}
                dropdownMatchSelectWidth={false}
              />
            </Form.Item>
          </Col>
          <Col flex='auto' style={{ minWidth: 0 }}>
            <QueryQueryInput snapRangeRef={snapRangeRef} executeQuery={executeQuery} />
          </Col>
          <Col flex='none'>
            <Form.Item name={['query', 'range']} initialValue={logsDefaultRange} noStyle>
              <TimeRangePicker
                onChange={() => {
                  snapRangeRef.current = {
                    from: undefined,
                    to: undefined,
                  };
                  executeQuery();
                }}
              />
            </Form.Item>
          </Col>
          <Col flex='none'>
            <Button
              type='primary'
              onClick={() => {
                snapRangeRef.current = {
                  from: undefined,
                  to: undefined,
                };
                executeQuery();
              }}
              loading={executeLoading}
            >
              {t(`${logExplorerNS}:execute`)}
            </Button>
          </Col>
          <Col flex='none'>
            <MainMoreOperations />
          </Col>
        </Row>
      </div>

      <RawMain
        indexData={indexData}
        rangeRef={rangeRef}
        snapRangeRef={snapRangeRef}
        organizeFields={organizeFields}
        setOrganizeFields={setOrganizeFields}
        handleValueFilter={handleValueFilter}
        executeQuery={executeQuery}
        setExecuteLoading={setExecuteLoading}
        interval={interval}
        setInterval={setInterval}
        intervalFixedRef={intervalFixedRef}
        serviceParams={serviceParams}
        setServiceParams={setServiceParams}
        getServiceParams={getServiceParams}
      />
    </div>
  );
}
