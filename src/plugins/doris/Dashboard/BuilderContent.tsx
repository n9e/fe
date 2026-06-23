import React, { useMemo, useEffect, useRef, useContext } from 'react';
import { Form, Row, Col, Space, Segmented, Select, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import _ from 'lodash';
import { useRequest } from 'ahooks';
import { SqlMonacoPreview } from '@fc-components/monaco-editor';

import { CommonStateContext as AppCommonStateContext } from '@/App';
import { SIZE, DatasourceCateEnum } from '@/utils/constant';

import { NAME_SPACE, DATE_TYPE_LIST } from '../constants';
import { getDorisIndex, Field } from '../services';
import { FieldSampleParams } from '../ExplorerNG/types';
import DatabaseSelect from '../Explorer/Query/DatabaseSelect';
import TableSelect from '../Explorer/Query/TableSelect';
import DateFieldSelect from '../Explorer/Query/DateFieldSelect';
import Filters from '../ExplorerNG/components/QueryBuilder/Filters';
import Aggregates from '../ExplorerNG/components/QueryBuilder/Aggregates';
import OrderBy from '../ExplorerNG/components/QueryBuilder/OrderBy';
import AdvancedSettings from '../components/AdvancedSettings';
import LegendInput from '../components/LegendInput';
import CommonStateContext from '../ExplorerNG/components/QueryBuilder/commonStateContext';
import getMaxLabelWidth from '../ExplorerNG/components/QueryBuilder/utils/getMaxLabelWidth';

interface Props {
  field: any;
  datasourceValue: number;
  onBuilderChange?: () => void;
}

export default function BuilderContent(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(AppCommonStateContext);
  const { field, datasourceValue, onBuilderChange } = props;
  const previewSql = Form.useWatch(['targets', field.name, 'query', 'query']);
  const chartForm = Form.useFormInstance();
  const queryValues = Form.useWatch(['targets', field.name, 'query']);

  const builderConfig = Form.useWatch(['targets', field.name, 'query', 'builderConfig']);

  const filters = builderConfig?.filters;
  const aggregates = builderConfig?.aggregates;
  const group_by = builderConfig?.group_by;

  // 使用 ref 确保异步回调和 useRequest 中始终使用最新的 datasourceValue
  const datasourceValueRef = useRef(datasourceValue);
  useEffect(() => {
    datasourceValueRef.current = datasourceValue;
  });

  // 切换数据源时清空 Builder 相关字段
  const prevDatasourceRef = useRef(datasourceValue);
  useEffect(() => {
    if (prevDatasourceRef.current !== datasourceValue && prevDatasourceRef.current) {
      chartForm.setFields([
        { name: ['targets', field.name, 'query', 'builderConfig'], value: undefined },
        { name: ['targets', field.name, 'query', 'query'], value: undefined },
      ]);
    }
    prevDatasourceRef.current = datasourceValue;
  }, [datasourceValue]);

  const indexDataService = () => {
    return getDorisIndex({
      cate: DatasourceCateEnum.doris,
      datasource_id: datasourceValueRef.current,
      database: queryValues?.builderConfig?.database,
      table: queryValues?.builderConfig?.table,
    })
      .then((res) => {
        const timeField = queryValues?.builderConfig?.time_field;
        const fieldExists = _.some(res, (item) => item.field === timeField);
        if (!timeField || !fieldExists) {
          const firstDateField = _.find(res, (item) => {
            return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
          })?.field;
          if (firstDateField) {
            chartForm.setFields([
              {
                name: ['targets', field.name, 'query', 'builderConfig', 'time_field'],
                value: firstDateField,
              },
            ]);
          }
        }
        return res;
      })
      .catch(() => []);
  };

  const { data: indexData = [] } = useRequest<Field[] | undefined, any>(indexDataService, {
    refreshDeps: [queryValues?.builderConfig?.database, queryValues?.builderConfig?.table],
    ready: !!datasourceValue && !!queryValues?.builderConfig?.database && !!queryValues?.builderConfig?.table,
  });

  const dateFields = useMemo(() => {
    return _.filter(indexData, (item) => {
      return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
    });
  }, [indexData]);

  const fieldSampleParams = useMemo(() => {
    if (!queryValues?.builderConfig?.database || !queryValues?.builderConfig?.table || !queryValues?.builderConfig?.time_field) return {} as FieldSampleParams;
    return {
      cate: DatasourceCateEnum.doris,
      datasource_id: datasourceValue,
      database: queryValues.builderConfig.database,
      table: queryValues.builderConfig.table,
      time_field: queryValues.builderConfig.time_field,
      filters: filters || [],
      from: moment().subtract(24, 'hours').unix(),
      to: moment().unix(),
      limit: 100,
    };
  }, [datasourceValue, queryValues?.builderConfig?.database, queryValues?.builderConfig?.table, queryValues?.builderConfig?.time_field, JSON.stringify(filters)]);

  const validIndexData = useMemo(() => {
    return _.filter(indexData, (item) => {
      return item.indexable === true;
    });
  }, [indexData]);

  const maxLabelWidth = useMemo(() => {
    return getMaxLabelWidth([t('builder.filters.label'), t('builder.aggregates.label'), t('builder.display_label'), t('builder.order_by.label')]);
  }, [i18n.language]);

  const builderMode = Form.useWatch(['targets', field.name, 'query', 'builderConfig', 'mode']);

  // 同步 builderConfig.mode → query.mode
  useEffect(() => {
    if (builderMode) {
      const mappedMode = builderMode === 'timeseries' ? 'timeSeries' : 'raw';
      const currentQueryMode = _.get(queryValues, 'mode');
      if (currentQueryMode !== mappedMode) {
        chartForm.setFields([
          {
            name: ['targets', field.name, 'query', 'mode'],
            value: mappedMode,
          },
        ]);
      }
    }
  }, [builderMode]);

  const markBuilderDirty = () => {
    onBuilderChange?.();
  };

  const ignoreNextOutsideClickRef = useRef(false);

  return (
    <CommonStateContext.Provider
      value={{
        ignoreNextOutsideClick: () => {
          ignoreNextOutsideClickRef.current = true;
        },
      }}
    >
      <Row gutter={10} wrap>
        <Col span={8}>
          <Form.Item
            {...field}
            label={t('query.database')}
            name={[field.name, 'query', 'builderConfig', 'database']}
            rules={[{ required: true, message: t('query.database_msg') }]}
          >
            <DatabaseSelect
              datasourceValue={datasourceValue}
              onChange={() => {
                const currentBC = chartForm.getFieldValue(['targets', field.name, 'query', 'builderConfig']);
                chartForm.setFields([{ name: ['targets', field.name, 'query', 'builderConfig'], value: { database: currentBC?.database } }]);
                markBuilderDirty();
              }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item {...field} label={t('query.table')} name={[field.name, 'query', 'builderConfig', 'table']} rules={[{ required: true, message: t('query.table_msg') }]}>
            <TableSelect
              datasourceValue={datasourceValue}
              database={queryValues?.builderConfig?.database}
              onChange={() => {
                const currentBC = chartForm.getFieldValue(['targets', field.name, 'query', 'builderConfig']);
                chartForm.setFields([{ name: ['targets', field.name, 'query', 'builderConfig'], value: _.pick(currentBC, ['database', 'table']) }]);
                markBuilderDirty();
              }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            {...field}
            label={t('query.time_field')}
            name={[field.name, 'query', 'builderConfig', 'time_field']}
            rules={[{ required: true, message: t('query.time_field_msg') }]}
          >
            <DateFieldSelect dateFields={dateFields} onChange={markBuilderDirty} />
          </Form.Item>
        </Col>
      </Row>
      <div className='w-full table border-separate border-spacing-y-2 mt-[-12px]'>
        <div
          className='table-column'
          style={{
            width: maxLabelWidth,
          }}
        />
        <div className='table-column' />
        <div className='table-row'>
          <div className='table-cell align-top'>
            <div className='h-[24px] flex items-center'>
              <span>{t('builder.filters.label')}</span>
            </div>
          </div>
          <div className='table-cell'>
            <Form.Item name={[field.name, 'query', 'builderConfig', 'filters']} noStyle initialValue={[]}>
              <Filters size='small' indexData={validIndexData} fieldSampleParams={fieldSampleParams} onChange={markBuilderDirty} />
            </Form.Item>
          </div>
        </div>
        <div className='table-row'>
          <div className='table-cell align-top'>
            <div className='h-[24px] flex items-center'>{t('builder.aggregates.label')}</div>
          </div>
          <div className='table-cell'>
            <Form.Item name={[field.name, 'query', 'builderConfig', 'aggregates']} noStyle initialValue={[]}>
              <Aggregates indexData={validIndexData} onChange={markBuilderDirty} />
            </Form.Item>
          </div>
        </div>
        <div className='table-row'>
          <div className='table-cell align-top'>
            <div className='h-[24px] flex items-center'>{t('builder.display_label')}</div>
          </div>
          <div className='table-cell'>
            <Space size={SIZE} wrap>
              <Form.Item name={[field.name, 'query', 'builderConfig', 'mode']} noStyle initialValue='table'>
                <Segmented
                  size='small'
                  options={[
                    { label: t('builder.mode.table'), value: 'table' },
                    { label: t('builder.mode.timeseries'), value: 'timeseries' },
                  ]}
                  onChange={markBuilderDirty}
                />
              </Form.Item>
              <Form.Item name={[field.name, 'query', 'builderConfig', 'group_by']} noStyle initialValue={[]}>
                <Select
                  size='small'
                  className='min-w-[160px] doris-query-builder-group-by-select'
                  dropdownClassName='doris-query-builder-popup'
                  options={_.map(indexData, (item) => {
                    return { label: item.field, value: item.field };
                  })}
                  mode='multiple'
                  showSearch
                  optionFilterProp='label'
                  dropdownMatchSelectWidth={false}
                  placeholder={t('builder.group_by')}
                  onChange={markBuilderDirty}
                />
              </Form.Item>
              <Form.Item name={[field.name, 'query', 'builderConfig', 'limit']} noStyle initialValue={100}>
                <InputNumber size='small' className='w-[80px]' min={1} max={10000000} placeholder={t('builder.limit')} onChange={markBuilderDirty} />
              </Form.Item>
            </Space>
          </div>
        </div>
        <div className='table-row mb-4'>
          <div className='table-cell align-top'>
            <div className='h-[24px] flex items-center'>{t('builder.order_by.label')}</div>
          </div>
          <div className='table-cell'>
            <Form.Item name={[field.name, 'query', 'builderConfig', 'order_by']} noStyle initialValue={[]}>
              <OrderBy indexData={validIndexData} aggregates={aggregates} group_by={group_by} onChange={markBuilderDirty} />
            </Form.Item>
          </div>
        </div>
      </div>
      {previewSql && (
        <div className={`p-3 rounded max-h-[160px] overflow-y-auto mb-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <SqlMonacoPreview theme={darkMode ? 'dark' : 'light'} value={previewSql} />
        </div>
      )}
      {builderMode === 'timeseries' && <AdvancedSettings span={8} prefixField={field} prefixName={[field.name, 'query']} expanded />}
      {builderMode === 'timeseries' && (
        <Form.Item
          label='Legend'
          {...field}
          name={[field.name, 'legend']}
          tooltip={{
            getPopupContainer: () => document.body,
            title: t('dashboard:query.legendTip2', {
              interpolation: { skipOnVariables: true },
            }),
          }}
        >
          <LegendInput />
        </Form.Item>
      )}
    </CommonStateContext.Provider>
  );
}
