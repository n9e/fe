import React, { useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Form, Segmented } from 'antd';
import { useLocation } from 'react-router-dom';
import { Resizable } from 're-resizable';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import { DatasourceSelectV3 } from '@/components/DatasourceSelect';
import { setLocalQueryHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';
import { setLocalQueryHistory as setLocalQueryHistoryUtil } from '@/components/HistoricalRecords';
import { DefaultFormValuesControl } from '@/pages/logExplorer/types';

import { useGlobalState } from '../globalState';
import { NAME_SPACE, QUERY_CACHE_KEY, QUERY_CACHE_PICK_KEYS, SQL_CACHE_KEY, SIDEBAR_CACHE_KEY } from '../constants';
import { Field } from '../types';
import { getOrganizeFieldsFromLocalstorage, setOrganizeFieldsToLocalstorage } from './utils/organizeFieldsLocalstorage';
import { getPinIndexFromLocalstorage } from './utils/pinIndexLocalstorage';
import { getDefaultSearchIndexFromLocalstorage } from './utils/defaultSearchIndexLocalstorage';
import QueryModeQuerySidebar from './QueryMode/Sidebar';
import SQLModeQuerySidebar from './SQLMode/Sidebar';
import QueryModeMain from './QueryMode/Main';
import SQLModeMain from './SQLMode/Main';

import './style.less';

interface Props {
  disabled?: boolean;
  defaultFormValuesControl?: DefaultFormValuesControl;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const location = useLocation();
  const { datasourceCateOptions } = useContext(CommonStateContext);
  const [, setExplorerParsedRange] = useGlobalState('explorerParsedRange');
  const [, setExplorerSnapRange] = useGlobalState('explorerSnapRange');
  const { disabled, defaultFormValuesControl } = props;
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue');
  const mode = Form.useWatch(['query', 'mode']);
  const range = Form.useWatch(['query', 'range']);
  const refreshFlag = Form.useWatch('refreshFlag');

  const [width, setWidth] = useState(_.toNumber(localStorage.getItem(SIDEBAR_CACHE_KEY) || 200));
  const [queryLogsOrganizeFields, setQueryLogsOrganizeFields] = useState<string[]>([]);
  const [sqlLogsOrganizeFields, setSqlLogsOrganizeFields] = useState<string[]>([]);
  const [pinIndex, setPinIndex] = useState<Field | undefined>();
  const [defaultSearchIndex, setDefaultSearchIndex] = useState<Field | undefined>();
  const [indexData, setIndexData] = useState<Field[]>([]);

  const executeQuery = () => {
    form.validateFields().then((values) => {
      // 设置 tabs 缓存值
      if (defaultFormValuesControl?.setDefaultFormValues) {
        defaultFormValuesControl.setDefaultFormValues({
          datasourceCate: DatasourceCateEnum.doris,
          datasourceValue,
          query: values.query,
        });
      }

      // 设置历史记录方法
      const queryValues = values.query;
      if (queryValues.mode === 'query') {
        if (queryValues.database && queryValues.table && queryValues.time_field) {
          setLocalQueryHistory(`${QUERY_CACHE_KEY}-${datasourceValue}`, _.pick(queryValues, QUERY_CACHE_PICK_KEYS));
        }
      } else if (queryValues.mode === 'sql') {
        if (queryValues.query) {
          setLocalQueryHistoryUtil(`${SQL_CACHE_KEY}-${datasourceValue}`, queryValues.query);
        }
      }

      // 如果是相对时间范围，则更新 explorerParsedRange
      const range = values.query?.range;
      if (_.isString(range?.start) && _.isString(range?.end)) {
        setExplorerParsedRange(parseRange(range));
      }

      // 每次执行查询，重置 explorerSnapRange
      setExplorerSnapRange({});
      form.setFieldsValue({
        refreshFlag: _.uniqueId('refreshFlag_'),
      });
    });
  };

  useEffect(() => {
    // 外部修改了 range，则更新 explorerParsedRange
    const parsedRange = range ? parseRange(range) : { start: undefined, end: undefined };
    setExplorerParsedRange(parsedRange);
  }, [JSON.stringify(range)]);

  useEffect(() => {
    if (defaultFormValuesControl?.isInited) {
      const datasourceValue = form.getFieldValue('datasourceValue');
      const queryValues = form.getFieldValue('query');
      if (queryValues?.mode === 'query') {
        setQueryLogsOrganizeFields(
          getOrganizeFieldsFromLocalstorage({
            datasourceValue,
            mode: queryValues?.mode,
            database: queryValues?.database,
            table: queryValues?.table,
          }),
        );
        setPinIndex(
          getPinIndexFromLocalstorage({
            datasourceValue,
            database: queryValues?.database,
            table: queryValues?.table,
          }),
        );
        setDefaultSearchIndex(
          getDefaultSearchIndexFromLocalstorage({
            datasourceValue,
            database: queryValues?.database,
            table: queryValues?.table,
          }),
        );
      } else if (queryValues?.mode === 'sql') {
        setSqlLogsOrganizeFields(
          getOrganizeFieldsFromLocalstorage({
            datasourceValue,
            mode: queryValues?.mode,
          }),
        );
      }
    }
  }, [defaultFormValuesControl?.isInited]);

  return (
    <div className={`h-full ${NAME_SPACE}-explorer-container`}>
      <Form.Item name='refreshFlag' hidden>
        <div />
      </Form.Item>
      <div className='h-full flex gap-4'>
        <Resizable
          size={{ width, height: '100%' }}
          enable={{
            right: true,
          }}
          onResizeStop={(e, direction, ref, d) => {
            let curWidth = width + d.width;
            if (curWidth < 200) {
              curWidth = 200;
            }
            setWidth(curWidth);
            localStorage.setItem(SIDEBAR_CACHE_KEY, curWidth.toString());
          }}
        >
          <div className='flex-shrink-0 h-full flex flex-col'>
            <div className='flex-shrink-0'>
              <Form.Item
                name='datasourceValue'
                rules={[
                  {
                    required: true,
                    message: t('common:datasource.id_required'),
                  },
                ]}
              >
                <DatasourceSelectV3
                  className='w-full'
                  datasourceCateList={datasourceCateOptions}
                  ajustDatasourceList={(list) => {
                    return _.filter(list, (item) => {
                      const cateData = _.find(datasourceCateOptions, { value: item.plugin_type });
                      if (cateData && _.includes(cateData.type, 'logging') && item.plugin_type === DatasourceCateEnum.doris) {
                        return cateData.graphPro ? IS_PLUS : true;
                      }
                      return false;
                    });
                  }}
                  onChange={(datasourceValue, datasourceCate) => {
                    // 先清空 query
                    form.setFieldsValue({
                      datasourceCate,
                      datasourceValue,
                      query: undefined,
                    });
                    form.setFieldsValue({
                      query: {
                        range: {
                          start: 'now-1h',
                          end: 'now',
                        },
                      },
                    });
                  }}
                />
              </Form.Item>
              <Form.Item name={['query', 'mode']} initialValue='query'>
                <Segmented
                  block
                  options={[
                    {
                      label: t('query.mode.query'),
                      value: 'query',
                    },
                    {
                      label: t('query.mode.sql'),
                      value: 'sql',
                    },
                  ]}
                />
              </Form.Item>
            </div>
            {mode === 'query' && (
              <QueryModeQuerySidebar
                disabled={disabled}
                datasourceValue={datasourceValue}
                executeQuery={executeQuery}
                organizeFields={queryLogsOrganizeFields}
                setOrganizeFields={(value) => {
                  const queryValues = form.getFieldValue('query');
                  setQueryLogsOrganizeFields(value);
                  setOrganizeFieldsToLocalstorage(
                    {
                      datasourceValue,
                      mode: 'query',
                      database: queryValues?.database,
                      table: queryValues?.table,
                    },
                    value,
                  );
                }}
                pinIndex={pinIndex}
                setPinIndex={setPinIndex}
                defaultSearchIndex={defaultSearchIndex}
                setDefaultSearchIndex={setDefaultSearchIndex}
                onIndexDataChange={setIndexData}
              />
            )}
            {mode === 'sql' && <SQLModeQuerySidebar disabled={disabled} datasourceValue={datasourceValue} executeQuery={executeQuery} />}
          </div>
        </Resizable>
        <div className='min-w-0 flex-1'>
          {mode === 'query' && (
            <QueryModeMain
              pinIndex={pinIndex}
              defaultSearchIndex={defaultSearchIndex}
              indexData={indexData}
              organizeFields={queryLogsOrganizeFields}
              setOrganizeFields={(value) => {
                const queryValues = form.getFieldValue('query');
                setQueryLogsOrganizeFields(value);
                setOrganizeFieldsToLocalstorage(
                  {
                    datasourceValue,
                    mode: 'query',
                    database: queryValues?.database,
                    table: queryValues?.table,
                  },
                  value,
                );
              }}
              executeQuery={executeQuery}
            />
          )}
          {mode === 'sql' && (
            <SQLModeMain
              organizeFields={sqlLogsOrganizeFields}
              setOrganizeFields={(value) => {
                setSqlLogsOrganizeFields(value);
                setOrganizeFieldsToLocalstorage(
                  {
                    datasourceValue,
                    mode: 'sql',
                  },
                  value,
                );
              }}
              executeQuery={executeQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
}
