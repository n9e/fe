import React, { useContext, useEffect, useState } from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { setDefaultDatasourceValue } from '@/utils';
import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import { allCates } from '@/components/AdvancedWrap/utils';
import ViewSelect, { ModalState } from '@/components/ViewSelect';
import { DatasourceSelectV3 } from '@/components/DatasourceSelect';
import omitUndefinedDeep from '@/pages/logExplorer/utils/omitUndefinedDeep';

import { DefaultFormValuesControl, RenderCommonSettingsParams } from './types';
import { NAME_SPACE, ENABLED_VIEW_CATES } from './constants';

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

  // 统一维护 ViewSelect 的状态，这样 ViewSelect 组件本身就是一个无状态组件
  const [viewSelectValue, setViewSelectValue] = useState<number>();
  const [viewSelectFilters, setViewSelectFilters] = useState<{ searchText: string; publicCate?: number }>({ searchText: '', publicCate: undefined });
  const [viewModalState, setViewModalState] = useState<ModalState>({
    visible: false,
  });

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
          <PlusLogExplorer
            tabKey={tabKey}
            datasourceCate={datasourceCate}
            defaultFormValuesControl={defaultFormValuesControl}
            renderCommonSettings={({ getDefaultQueryValues, executeQuery }: RenderCommonSettingsParams) => {
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
                            range: range ?? logsDefaultRange ?? { start: 'now-5m', end: 'now' },
                            ...(getDefaultQueryValues ? getDefaultQueryValues(filterValues.query || {}) || {} : {}),
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
                        const queryValues = form.getFieldValue('query');
                        form.setFieldsValue({
                          datasourceCate,
                          datasourceValue,
                          query: undefined,
                        });
                        form.setFieldsValue({
                          refreshFlag: undefined,
                          query: {
                            range: queryValues.range ?? logsDefaultRange ?? { start: 'now-5m', end: 'now' },
                            ...(getDefaultQueryValues ? getDefaultQueryValues(queryValues || {}) || {} : {}),
                          },
                        });
                      }}
                    />
                  </Form.Item>
                </div>
              );
            }}
          />
        </Form>
      </div>
    </div>
  );
}
