import React, { useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import { Form } from 'antd';
import moment from 'moment';
import { useGetState } from 'ahooks';

import { setLocalQueryHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';
import { parseRange } from '@/components/TimeRangePicker';
import { DefaultFormValuesControl, RenderCommonSettings } from '@/pages/logExplorer/types';
import { OnValueFilterParams } from '@/pages/logExplorer/components/LogsViewer/types';
import SideBar from '@/pages/logExplorer/components/SideBar';

import { NAME_SPACE, QUERY_CACHE_KEY, QUERY_CACHE_PICK_KEYS, DEFAULT_LOGS_PAGE_SIZE } from '../constants';
import { Field, Interval } from './types';
import { getOrganizeFieldsFromLocalstorage, setOrganizeFieldsToLocalstorage } from './utils/organizeFieldsLocalstorage';
import calcInterval from './utils/calcInterval';

import SideBarNav from './SideBarNav';
import Main from './Main';

import './style.less';

interface Props {
  tabKey: string;
  disabled?: boolean;
  defaultFormValuesControl?: DefaultFormValuesControl;
  renderCommonSettings: RenderCommonSettings;

  isOpenSearch?: boolean; // 是否是 OpenSearch，OpenSearch 是 Elasticsearch 的分支，Explorer 组件基本通用，但在某些细节上会有差异，所以单独传一个标识来区分，目前 openSearch 是不存在 indexPattern
}

export default function index(props: Props) {
  const { disabled, defaultFormValuesControl, renderCommonSettings, isOpenSearch } = props;

  const form = Form.useFormInstance();

  const [organizeFields, setOrganizeFields] = useState<string[]>([]);
  const [indexData, setIndexData] = useState<Field[]>([]);

  // 聚合粒度设置
  const [interval, setInterval] = useState<Interval>();
  const intervalFixedRef = useRef<boolean>(false);

  // 用于显示展示的时间范围
  const rangeRef = useRef<{
    from: number;
    to: number;
  }>();
  const [serviceParams, setServiceParams, getServiceParams] = useGetState<{
    current: number;
    pageSize: number;
    reverse: boolean;
    refreshFlag: string | undefined;
  }>({
    current: 1,
    pageSize: DEFAULT_LOGS_PAGE_SIZE,
    reverse: true,
    refreshFlag: undefined,
  });

  const executeQuery = () => {
    // setFieldsValue 是异步执行，但是 validateFields 是同步的，所以用 setTimeout 把 validateFields 放到下一个事件循环中执行
    setTimeout(() => {
      form.validateFields().then((values) => {
        const queryValues = values.query;

        if (!intervalFixedRef.current && queryValues.range) {
          const { start, end } = parseRange(queryValues.range);
          const newInterval = calcInterval(moment(start), moment(end));
          setInterval(newInterval);
        }

        // 设置 tabs 缓存值
        if (defaultFormValuesControl?.setDefaultFormValues) {
          defaultFormValuesControl.setDefaultFormValues({
            datasourceCate: values.datasourceCate,
            datasourceValue: values.datasourceValue,
            query: queryValues,
          });
        }

        // 设置历史记录方法
        setLocalQueryHistory(`${QUERY_CACHE_KEY}-${values.datasourceValue}`, _.pick(queryValues, QUERY_CACHE_PICK_KEYS));

        form.setFieldsValue({
          refreshFlag: _.uniqueId('refreshFlag_'),
        });
      });
    }, 0);
  };

  const handleValueFilter = (params: OnValueFilterParams) => {
    const { key, value, operator } = params;
    let currentFilters = form.getFieldValue(['query', 'filters']) || [];

    // const currentFilters = getFilters();
    if (operator === 'EXISTS') {
      // 如果是 exists 操作，则不需要 value
      if (!_.find(currentFilters, { key, operator })) {
        currentFilters = [...(currentFilters || []), { key, operator, value: '' }];
      }
    } else {
      if (value !== undefined && value !== null) {
        // key + value 作为唯一标识，存在则更新，不存在则新增
        if (!_.find(currentFilters, { key, value, operator })) {
          currentFilters = [...(currentFilters || []), { key, value, operator }];
        } else {
          currentFilters = _.map(currentFilters, (item) => {
            if (item.key === key && item.value === value) {
              return {
                ...item,
                value,
                operator,
              };
            }
            return item;
          });
        }
      }
    }

    form.setFieldsValue({
      query: {
        filters: currentFilters,
      },
    });
    executeQuery();
  };

  useEffect(() => {
    if (defaultFormValuesControl?.isInited) {
      const datasourceValue = form.getFieldValue('datasourceValue');
      const queryValues = form.getFieldValue('query');
      setOrganizeFields(
        getOrganizeFieldsFromLocalstorage({
          datasourceValue,
          index: queryValues?.index,
        }),
      );
    }
  }, [defaultFormValuesControl?.isInited]);

  return (
    <>
      <div className={`h-full ${NAME_SPACE}-explorer-container`}>
        <Form.Item name='refreshFlag' hidden>
          <div />
        </Form.Item>
        <Form.Item name={['query', 'filters']} hidden>
          <div />
        </Form.Item>
        <div className='h-full flex'>
          <SideBar ns={NAME_SPACE}>
            {renderCommonSettings({
              getDefaultQueryValues: (queryValues: Record<string, any>) => {
                return {
                  mode: queryValues.mode || 'indices',
                  syntax: queryValues.syntax || 'kuery',
                };
              },
              executeQuery,
            })}
            <SideBarNav
              disabled={disabled}
              executeQuery={executeQuery}
              organizeFields={organizeFields} // 使用到了 query 的 organizeFields
              setOrganizeFields={(value, setLocalstorage = true) => {
                const datasourceValue = form.getFieldValue('datasourceValue');
                const queryValues = form.getFieldValue('query');
                // 初始化时从本地获取，query、sql 都有可能设置
                setOrganizeFields(value);
                // 字段列表选择 "显示字段" 时更新本地缓存，这里只更新 query 模式的，sql 模式是在右侧表格设置项里设置的
                if (setLocalstorage) {
                  setOrganizeFieldsToLocalstorage(
                    {
                      datasourceValue,
                      index: queryValues?.index,
                    },
                    value,
                  );
                }
              }}
              onIndexDataChange={setIndexData}
              handleValueFilter={handleValueFilter}
              requestParams={{ from: (serviceParams.current - 1) * serviceParams.pageSize, range: rangeRef.current, limit: serviceParams.pageSize, reverse: serviceParams.reverse }}
              isOpenSearch={isOpenSearch}
            />
          </SideBar>
          <div className='min-w-0 flex-1'>
            <Main
              indexData={indexData}
              organizeFields={organizeFields}
              setOrganizeFields={(value) => {
                const datasourceValue = form.getFieldValue('datasourceValue');
                const queryValues = form.getFieldValue('query');
                setOrganizeFields(value);
                setOrganizeFieldsToLocalstorage(
                  {
                    datasourceValue,
                    index: queryValues?.index,
                  },
                  value,
                );
              }}
              executeQuery={executeQuery}
              handleValueFilter={handleValueFilter}
              interval={interval}
              setInterval={setInterval}
              intervalFixedRef={intervalFixedRef}
              rangeRef={rangeRef}
              serviceParams={serviceParams}
              setServiceParams={setServiceParams}
              getServiceParams={getServiceParams}
            />
          </div>
        </div>
      </div>
    </>
  );
}
