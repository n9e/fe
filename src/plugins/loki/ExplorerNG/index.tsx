import React, { useState } from 'react';
import _ from 'lodash';
import { Form } from 'antd';

import { setLocalQueryHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';
import { DefaultFormValuesControl, RenderCommonSettings } from '@/pages/logExplorer/types';
import SideBar from '@/pages/logExplorer/components/SideBar';

import { NAME_SPACE } from '../constants';
import { Field } from './types';
import { DEFAULT_RAW_LOG_LIMIT, METRIC_DEFAULT_QUERY, QUERY_CACHE_KEY, RAW_DEFAULT_QUERY } from './constants';
import { classifyExplorerMode } from './utils/logsQL';
import Main from './Main';
import SideBarNav from './SideBarNav';

import './style.less';

interface Props {
  tabKey: string;
  disabled?: boolean;
  defaultFormValuesControl?: DefaultFormValuesControl;
  renderCommonSettings: RenderCommonSettings;
}

export default function index(props: Props) {
  const { tabKey, defaultFormValuesControl, renderCommonSettings } = props;
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue', form);
  const [indexData, setIndexData] = useState<Field[]>([]);
  const [executeLoading, setExecuteLoading] = useState(false);

  const executeQuery = () => {
    setTimeout(() => {
      form
        .validateFields()
        .then((values) => {
          const queryValues = values.query || {};
          const userQL = _.trim(queryValues.query);
          const nextMode = classifyExplorerMode(userQL);
          const nextQueryValues = {
            ...queryValues,
            mode: nextMode,
            ...(nextMode === 'metric' && queryValues.mode !== 'metric' ? { vizType: 'table' } : {}),
          };
          if (defaultFormValuesControl?.setDefaultFormValues) {
            defaultFormValuesControl.setDefaultFormValues({
              datasourceCate: values.datasourceCate,
              datasourceValue: values.datasourceValue,
              query: nextQueryValues,
            });
          }
          if (nextQueryValues.query) {
            setLocalQueryHistory(`${QUERY_CACHE_KEY}-${nextMode}-${values.datasourceValue}`, {
              mode: nextMode,
              query: nextQueryValues.query,
            });
          }
          form.setFieldsValue({
            query: nextQueryValues,
            refreshFlag: _.uniqueId('refreshFlag_'),
          });
        })
        .catch(() => undefined);
    }, 0);
  };

  return (
    <div className={`h-full ${NAME_SPACE}-explorer-container loki-explorer-container-${tabKey}`}>
      <Form.Item name='refreshFlag' hidden>
        <div />
      </Form.Item>
      <Form.Item name={['query', 'builder']} hidden>
        <div />
      </Form.Item>
      <Form.Item name={['query', 'builderStatus']} hidden>
        <div />
      </Form.Item>
      <Form.Item name={['query', 'querySource']} hidden>
        <div />
      </Form.Item>
      <div className='h-full flex'>
        <SideBar ns={NAME_SPACE}>
          {renderCommonSettings({
            getDefaultQueryValues: (queryValues: Record<string, any>) => {
              const mode = queryValues.mode || 'raw';
              return {
                mode,
                query: queryValues.query || (mode === 'metric' ? METRIC_DEFAULT_QUERY : RAW_DEFAULT_QUERY),
                vizType: queryValues.vizType || 'timeseries',
                limit: queryValues.limit || DEFAULT_RAW_LOG_LIMIT,
              };
            },
            executeQuery,
          })}
          <SideBarNav datasourceValue={datasourceValue} onFieldsChange={setIndexData} />
        </SideBar>
        <div className='min-w-0 flex-1'>
          <Main indexData={indexData} executeLoading={executeLoading} setExecuteLoading={setExecuteLoading} executeQuery={executeQuery} />
        </div>
      </div>
    </div>
  );
}
