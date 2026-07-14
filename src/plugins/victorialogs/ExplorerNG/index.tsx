import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Form } from 'antd';

import { setLocalQueryHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';
import { DefaultFormValuesControl, RenderCommonSettings } from '@/pages/logExplorer/types';

import { NAME_SPACE } from '../constants';
import { METRIC_DEFAULT_QUERY, QUERY_CACHE_KEY, RAW_DEFAULT_QUERY } from './constants';
import { classifyExplorerMode } from './utils/logsQL';
import Main from './Main';

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
  useEffect(() => {
    if (defaultFormValuesControl?.isInited) {
      const query = form.getFieldValue('query');
      if (query?.builder || query?.builderStatus || query?.querySource) {
        form.setFieldsValue({
          query: {
            ...query,
            builder: undefined,
            builderStatus: undefined,
            querySource: undefined,
          },
        });
      }
    }
  }, [defaultFormValuesControl?.isInited]);
  return (
    <div className={`h-full ${NAME_SPACE}-explorer-container victorialogs-explorer-container-${tabKey}`}>
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
      <div className='h-full flex flex-col'>
        {renderCommonSettings({
          getDefaultQueryValues: (queryValues: Record<string, any>) => {
            const mode = queryValues.mode || 'raw';
            return {
              mode,
              query: queryValues.query || (mode === 'metric' ? METRIC_DEFAULT_QUERY : RAW_DEFAULT_QUERY),
              vizType: queryValues.vizType || 'timeseries',
            };
          },
          executeQuery,
          layout: 'horizontal',
        })}
        <Main tabKey={tabKey} indexData={[]} executeLoading={executeLoading} setExecuteLoading={setExecuteLoading} executeQuery={executeQuery} />
      </div>
    </div>
  );
}
