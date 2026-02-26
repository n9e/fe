import React, { useContext, useEffect, useState, useRef } from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { setDefaultDatasourceValue } from '@/utils';
import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import { allCates, getGraphProByCate } from '@/components/AdvancedWrap/utils';
import ViewSelect, { ModalState } from '@/components/ViewSelect';
import { DatasourceSelectV3 } from '@/components/DatasourceSelect';
import omitUndefinedDeep from '@/pages/logExplorer/utils/omitUndefinedDeep';

import { DefaultFormValuesControl, RenderCommonSettingsParams } from './types';
import { NAME_SPACE, ENABLED_VIEW_CATES } from './constants';
import ExplorerContent from './ExplorerContent';

// @ts-ignore
import PlusLogExplorer from 'plus:/parcels/LogExplorer';

interface Props {
  active: boolean;
  tabKey: string;
  tabIndex?: number;
  defaultFormValuesControl?: DefaultFormValuesControl;
}

export default function Explorer(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceList, datasourceCateOptions, groupedDatasourceList, logsDefaultRange } = useContext(CommonStateContext);
  const location = useLocation();
  const { active, tabKey, defaultFormValuesControl } = props;

  const [form] = Form.useForm();
  const datasourceCate = Form.useWatch('datasourceCate', form);
  const datasourceValue = Form.useWatch('datasourceValue', form);

  const cateGraphPro = getGraphProByCate(datasourceCate);

  // 统一维护 ViewSelect 的状态，这样 ViewSelect 组件本身就是一个无状态组件
  const [viewSelectValue, setViewSelectValue] = useState<number>();
  const [viewSelectFilters, setViewSelectFilters] = useState<{ searchText: string; publicCate?: number }>({ searchText: '', publicCate: undefined });
  const [viewModalState, setViewModalState] = useState<ModalState>({
    visible: false,
  });
  const executeQueryRef = useRef<() => void>();
  const getDefaultQueryValuesRef = useRef<RenderCommonSettingsParams['getDefaultQueryValues']>();
  const [shouldExecuteQuery, setShouldExecuteQuery] = useState(false);
  const prevDatasourceCateRef = useRef<string>();
  const prevDatasourceValueRef = useRef<number>();

  useEffect(() => {
    if (shouldExecuteQuery && executeQueryRef.current) {
      if (active) {
        executeQueryRef.current();
        setShouldExecuteQuery(false);
      }
    }
  }, [shouldExecuteQuery, datasourceCate, active]);

  // 监听数据源类型/数据源值切换，重置 query 字段到默认值
  useEffect(() => {
    const cateChanged = prevDatasourceCateRef.current && prevDatasourceCateRef.current !== datasourceCate && datasourceCate;
    const valueChanged = prevDatasourceValueRef.current && prevDatasourceValueRef.current !== datasourceValue && datasourceValue;

    if (cateChanged || valueChanged) {
      // 数据源已切换，此时 renderCommonSettings 已经重新渲染，getDefaultQueryValues 是新的
      const queryValues = form.getFieldValue('query');
      // 只有在 query 为空或 undefined 时才设置默认值
      if (!queryValues || _.isEmpty(queryValues)) {
        const defaultQueryValues = getDefaultQueryValuesRef.current ? getDefaultQueryValuesRef.current({}) || {} : {};
        const newQueryValues = {
          range: logsDefaultRange ?? { start: 'now-5m', end: 'now' },
          ...defaultQueryValues,
        };
        form.setFieldsValue({
          query: newQueryValues,
        });
      }
    }
    prevDatasourceCateRef.current = datasourceCate;
    prevDatasourceValueRef.current = datasourceValue;
  }, [datasourceCate, datasourceValue]);

  useEffect(() => {
    if (active && defaultFormValuesControl?.defaultFormValues && defaultFormValuesControl?.isInited === false) {
      const searchParams = new URLSearchParams(location.search);
      defaultFormValuesControl.setIsInited();
      form.setFieldsValue({
        ...defaultFormValuesControl.defaultFormValues,
        refreshFlag: defaultFormValuesControl.defaultFormValues?.refreshFlag
          ? defaultFormValuesControl.defaultFormValues?.refreshFlag
          : searchParams.get('__execute__')
          ? _.uniqueId('refreshFlag_')
          : undefined,
      });
    }
  }, [active]);

  const renderCommonSettings = ({ getDefaultQueryValues, executeQuery }: RenderCommonSettingsParams) => {
    executeQueryRef.current = executeQuery;
    getDefaultQueryValuesRef.current = getDefaultQueryValues;
    return (
      <div className='flex-shrink-0'>
        <Form.Item>
          <ViewSelect<{
            datasourceCate: string;
            datasourceValue: number;
            [key: string]: any;
          }>
            // 统一的状态
            value={viewSelectValue}
            onChange={(value) => {
              setViewSelectValue(value);
            }}
            filters={viewSelectFilters}
            setFilters={setViewSelectFilters}
            modalState={viewModalState}
            setModalState={setViewModalState}
            // 其他 props
            disabled={!_.includes(ENABLED_VIEW_CATES, DatasourceCateEnum.doris)}
            page={location.pathname}
            getFilterValues={() => {
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
              return filterValues;
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
              const datasourceCate = form.getFieldValue('datasourceCate');

              filterValues.datasourceCate = filterValues.datasourceCate || datasourceCate;
              filterValues.datasourceValue = filterValues.datasourceValue || groupedDatasourceList[datasourceCate]?.[0]?.id!;

              let range = filterValues.query?.range;
              if (_.isNumber(range?.start) && _.isNumber(range?.end)) {
                range = {
                  start: moment.unix(range.start),
                  end: moment.unix(range.end),
                };
              }

              const isCateChanged = datasourceCate !== filterValues.datasourceCate;

              form.resetFields(['refreshFlag', 'query']);
              form.setFieldsValue({
                ...filterValues,
                query: {
                  ...filterValues.query,
                  range: range ?? logsDefaultRange ?? { start: 'now-5m', end: 'now' },
                  ...(getDefaultQueryValues ? getDefaultQueryValues(filterValues.query || {}) || {} : {}),
                },
              });

              if (isCateChanged) {
                setShouldExecuteQuery(true);
              } else if (executeQueryRef.current) {
                executeQueryRef.current();
              }
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
            placeholder={t('view_placeholder')}
          />
        </Form.Item>
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
                if (cateData && _.includes(cateData.type, 'logging') && _.includes(ENABLED_VIEW_CATES, item.plugin_type)) {
                  return cateData.graphPro ? IS_PLUS : true;
                }
                return false;
              });
            }}
            onChange={(datasourceValue, datasourceCate) => {
              setDefaultDatasourceValue(datasourceCate, datasourceValue);
              form.resetFields(['refreshFlag', 'query']);
              form.setFieldsValue({
                datasourceCate,
                datasourceValue,
              });
            }}
          />
        </Form.Item>
      </div>
    );
  };

  return (
    <div className={`h-full explorer-container-${tabKey}`}>
      <div className='h-full bg-fc-100 border border-fc-300 rounded-sm p-4'>
        <Form form={form} layout='vertical' className='h-full'>
          <Form.Item name='datasourceCate' hidden>
            <div />
          </Form.Item>
          <Form.Item name='datasourceValue' hidden>
            <div />
          </Form.Item>
          {cateGraphPro ? (
            <PlusLogExplorer tabKey={tabKey} datasourceCate={datasourceCate} defaultFormValuesControl={defaultFormValuesControl} renderCommonSettings={renderCommonSettings} />
          ) : (
            <ExplorerContent tabKey={tabKey} datasourceCate={datasourceCate} defaultFormValuesControl={defaultFormValuesControl} renderCommonSettings={renderCommonSettings} />
          )}
        </Form>
      </div>
    </div>
  );
}
