import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Col, Row, Form, Space } from 'antd';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';
import TimeRangePicker from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../../../constants';
import QueryInput from '../../components/QueryInput';
import MainMoreOperations from '../../components/MainMoreOperations';
import QueryInputAddonAfter from './QueryInputAddonAfter';
import Raw from './Raw';
import Timeseries from './Timeseries';

interface Props {
  organizeFields: string[];
  setOrganizeFields: (value: string[]) => void;
  executeQuery: () => void;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logsDefaultRange } = useContext(CommonStateContext);
  const { organizeFields, setOrganizeFields, executeQuery } = props;
  const submode = Form.useWatch(['query', 'submode']);
  const [executeLoading, setExecuteLoading] = React.useState(false);

  return (
    <div className='flex flex-col h-full'>
      <Row gutter={SIZE} className='flex-shrink-0'>
        <Col flex='auto'>
          <InputGroupWithFormItem label={<Space>{t(`${logExplorerNS}:query`)}</Space>} addonAfter={<QueryInputAddonAfter executeQuery={executeQuery} />}>
            <Form.Item name={['query', 'query']}>
              <QueryInput
                onChange={() => {
                  executeQuery();
                }}
              />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='none'>
          <Form.Item name={['query', 'range']} initialValue={logsDefaultRange}>
            <TimeRangePicker onChange={executeQuery} />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Button type='primary' onClick={executeQuery} loading={executeLoading}>
            {t(`${logExplorerNS}:execute`)}
          </Button>
        </Col>
        <Col flex='none'>
          <MainMoreOperations />
        </Col>
      </Row>
      {submode === 'raw' && <Raw organizeFields={organizeFields} setOrganizeFields={setOrganizeFields} setExecuteLoading={setExecuteLoading} />}
      {submode === 'timeseries' && <Timeseries setExecuteLoading={setExecuteLoading} />}
    </div>
  );
}
