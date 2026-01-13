import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Form } from 'antd';
import { Resizable } from 're-resizable';
import moment from 'moment';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import { setDefaultDatasourceValue } from '@/utils';
import ViewSelect from '@/components/ViewSelect';
import { allCates } from '@/components/AdvancedWrap/utils';
import { DatasourceSelectV3 } from '@/components/DatasourceSelect';
import { setLocalQueryHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';
import { setLocalQueryHistory as setLocalQueryHistoryUtil } from '@/components/HistoricalRecords';
import { ENABLED_VIEW_CATES, NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import { DefaultFormValuesControl } from '@/pages/logExplorer/types';
import omitUndefinedDeep from '@/pages/logExplorer/utils/omitUndefinedDeep';

import { NAME_SPACE, NG_QUERY_CACHE_KEY, NG_QUERY_CACHE_PICK_KEYS, NG_SQL_CACHE_KEY, SIDEBAR_CACHE_KEY } from '../constants';
import { Field } from '../types';
import { getOrganizeFieldsFromLocalstorage, setOrganizeFieldsToLocalstorage } from './utils/organizeFieldsLocalstorage';

import SideBarNav from './SideBarNav';
import Main from './Main';

import './style.less';

interface Props {
  tabKey: string;
  disabled?: boolean;
  defaultFormValuesControl?: DefaultFormValuesControl;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceList, datasourceCateOptions, groupedDatasourceList, logsDefaultRange } = useContext(CommonStateContext);
  const { tabKey, disabled, defaultFormValuesControl } = props;
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue');
  const stackByField = Form.useWatch(['query', 'stackByField']);
  const defaultSearchField = Form.useWatch(['query', 'defaultSearchField']);

  const [width, setWidth] = useState(_.toNumber(localStorage.getItem(SIDEBAR_CACHE_KEY) || 200));
  const [organizeFields, setOrganizeFields] = useState<string[]>([]);
  const [indexData, setIndexData] = useState<Field[]>([]);

  const executeQuery = () => {
    form.validateFields().then((values) => {
      // 设置 tabs 缓存值
      if (defaultFormValuesControl?.setDefaultFormValues) {
        defaultFormValuesControl.setDefaultFormValues({
          datasourceCate: DatasourceCateEnum.doris,
          datasourceValue: values.datasourceValue,
          query: values.query,
        });
      }

      // 设置历史记录方法
      const queryValues = values.query;
      if (queryValues.syntax === 'query') {
        if (queryValues.database && queryValues.table && queryValues.time_field) {
          setLocalQueryHistory(`${NG_QUERY_CACHE_KEY}-${datasourceValue}`, _.pick(queryValues, NG_QUERY_CACHE_PICK_KEYS));
        }
      } else if (queryValues.syntax === 'sql') {
        if (queryValues.query) {
          setLocalQueryHistoryUtil(`${NG_SQL_CACHE_KEY}-${datasourceValue}`, queryValues.query);
        }
      }

      form.setFieldsValue({
        refreshFlag: _.uniqueId('refreshFlag_'),
      });
    });
  };

  const handleSetStackByField = (index) => {
    form.setFieldsValue({
      query: {
        stackByField: index,
      },
    });
  };

  const handleSetDefaultSearchField = (index) => {
    form.setFieldsValue({
      query: {
        defaultSearchField: index,
      },
    });
  };

  const handleValueFilter = (params) => {
    const values = form.getFieldsValue();
    const query = values.query;
    let queryStr = _.trim(_.split(query.query, '|')?.[0]);
    if (queryStr === '*') {
      queryStr = '';
    }
    if (params.operator === 'AND') {
      queryStr += `${queryStr === '' ? '' : ' AND'} ${params.key}:"${params.value}"`;
    }
    if (params.operator === 'NOT') {
      queryStr += `${queryStr === '' ? ' NOT' : ' AND NOT'} ${params.key}:"${params.value}"`;
    }
    form.setFieldsValue({
      query: {
        query: queryStr,
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
          database: queryValues?.database,
          table: queryValues?.table,
        }),
      );
    }
  }, [defaultFormValuesControl?.isInited]);

  return (
    <div className={`h-full ${NAME_SPACE}-explorer-container`}>
      <Form.Item name='refreshFlag' hidden>
        <div />
      </Form.Item>
      <Form.Item name={['query', 'stackByField']} hidden>
        <div />
      </Form.Item>
      <Form.Item name={['query', 'defaultSearchField']} hidden>
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
            // 触发 resize 事件，让右侧图表重新计算尺寸
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
            }, 0);
          }}
        >
          <div className='flex-shrink-0 h-full flex flex-col'>
            <div className='flex-shrink-0'>
              <div className='mb-4'>
                <ViewSelect<{
                  datasourceCate: string;
                  datasourceValue: number;
                  [key: string]: any;
                }>
                  disabled={!_.includes(ENABLED_VIEW_CATES, DatasourceCateEnum.doris)}
                  page={location.pathname}
                  getFilterValuesJSONString={() => {
                    const formValues = form.getFieldsValue();
                    let range = formValues.query?.range;
                    if (moment.isMoment(range?.start) && moment.isMoment(range?.end)) {
                      range = {
                        start: range.start.unix(),
                        end: range.end.unix(),
                      };
                    }
                    const filterValues = {
                      datasourceCate: formValues.datasourceCate,
                      datasourceValue: formValues.datasourceValue,
                      query: {
                        ...formValues.query,
                        range,
                      },
                    };
                    return JSON.stringify(filterValues);
                  }}
                  renderOptionExtra={(filterValues) => {
                    const { datasourceCate, datasourceValue } = filterValues;
                    return (
                      <div className='flex items-center gap-2'>
                        <img src={_.get(_.find(allCates, { value: datasourceCate }), 'logo')} alt={datasourceCate} className='w-[12px] h-[12px]' />
                        <span>{_.find(datasourceList, { id: datasourceValue })?.name ?? datasourceValue}</span>
                      </div>
                    );
                  }}
                  onSelect={(filterValues) => {
                    filterValues.datasourceCate = filterValues.datasourceCate || DatasourceCateEnum.doris;
                    filterValues.datasourceValue = filterValues.datasourceValue || groupedDatasourceList[DatasourceCateEnum.doris]?.[0]?.id;
                    // 完全重置表单后再设置新值，避免旧值残留
                    form.setFieldsValue({
                      refreshFlag: undefined,
                      query: undefined,
                    });
                    let range = filterValues.query?.range;
                    if (_.isNumber(range?.start) && _.isNumber(range?.end)) {
                      range = {
                        start: moment.unix(range.start),
                        end: moment.unix(range.end),
                      };
                    }
                    form.setFieldsValue({
                      ...filterValues,
                      query: {
                        ...filterValues.query,
                        range,
                        syntax: filterValues.query?.syntax || 'query',
                      },
                    });
                    executeQuery();
                  }}
                  adjustOldFilterValues={(values) => {
                    if (values) {
                      // 去掉 query 中值为 undefined 的字段
                      const cleanedQuery = omitUndefinedDeep(values.query) || {};
                      if (moment.isMoment(cleanedQuery.range?.start) && moment.isMoment(cleanedQuery.range?.end)) {
                        cleanedQuery.range = {
                          start: cleanedQuery.range.start.unix(),
                          end: cleanedQuery.range.end.unix(),
                        };
                      }
                      return {
                        datasourceCate: values.datasourceCate,
                        datasourceValue: values.datasourceValue,
                        query: cleanedQuery,
                      };
                    }
                    return {};
                  }}
                  placeholder={t(`${logExplorerNS}:view_placeholder`)}
                />
              </div>
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
                    setDefaultDatasourceValue(datasourceCate, datasourceValue);
                    // 先清空 query
                    form.setFieldsValue({
                      datasourceCate,
                      datasourceValue,
                      query: undefined,
                    });
                    form.setFieldsValue({
                      query: {
                        syntax: 'query',
                        range: logsDefaultRange,
                      },
                    });
                  }}
                />
              </Form.Item>
            </div>
            <SideBarNav
              disabled={disabled}
              datasourceValue={datasourceValue}
              executeQuery={executeQuery}
              organizeFields={organizeFields} // 使用到了 query 的 organizeFields
              setOrganizeFields={(value, setLocalstorage = true) => {
                const queryValues = form.getFieldValue('query');
                // 初始化时从本地获取，query、sql 都有可能设置
                setOrganizeFields(value);
                // 字段列表选择 "显示字段" 时更新本地缓存，这里只更新 query 模式的，sql 模式是在右侧表格设置项里设置的
                if (setLocalstorage) {
                  setOrganizeFieldsToLocalstorage(
                    {
                      datasourceValue,
                      database: queryValues?.database,
                      table: queryValues?.table,
                    },
                    value,
                  );
                }
              }}
              onIndexDataChange={setIndexData}
              handleValueFilter={handleValueFilter}
              stackByField={stackByField}
              setStackByField={handleSetStackByField}
              defaultSearchField={defaultSearchField}
              setDefaultSearchField={handleSetDefaultSearchField}
            />
          </div>
        </Resizable>
        <div className='min-w-0 flex-1'>
          <Main
            tabKey={tabKey}
            indexData={indexData}
            organizeFields={organizeFields}
            setOrganizeFields={(value) => {
              setOrganizeFields(value);
            }}
            executeQuery={executeQuery}
            handleValueFilter={handleValueFilter}
            stackByField={stackByField}
            setStackByField={handleSetStackByField}
            defaultSearchField={defaultSearchField}
            setDefaultSearchField={handleSetDefaultSearchField}
          />
        </div>
      </div>
    </div>
  );
}
