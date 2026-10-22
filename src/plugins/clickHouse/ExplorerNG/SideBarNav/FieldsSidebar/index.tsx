import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Form, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import FieldsList from '@/pages/logExplorer/components/FieldsList';
import FieldStackButton from '@/pages/logExplorer/components/FieldsList/FieldStackButton';
import { parseUniqueCount } from '@/pages/logExplorer/components/FieldsList/useFieldStatsCache';
import { format } from '@/pages/dashboard/Renderer/utils/byteConverter';

import { Field, HandleValueFilterParams } from '../../types';
import { getCKLogsQuery, getCKSQLsPreview } from '../../../services';
import { getCKFieldIconType, isCKNumberType, NAME_SPACE } from '../../../constants';
import { PinIcon } from './PinIcon';

interface IProps {
  organizeFields: string[];
  setOrganizeFields: (newOrganizeFields: string[]) => void;
  data: Field[];
  loading: boolean;
  onValueFilter: HandleValueFilterParams;
  executeQuery: () => void;

  stackByField?: string;
  setStackByField: (field?: string) => void;
}

export default function index(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { organizeFields, setOrganizeFields, data, loading, onValueFilter, executeQuery, stackByField, setStackByField } = props;
  const fieldTypeMap = React.useMemo<Record<string, string>>(
    () =>
      _.omitBy(
        _.fromPairs(
          _.map(data, (field) => {
            return [field.type, getCKFieldIconType(field.type, field.normalized_type)];
          }),
        ),
        _.isUndefined,
      ) as Record<string, string>,
    [data],
  );
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch('query');
  const refreshFlag = Form.useWatch('refreshFlag');
  const statsCacheKey = JSON.stringify([
    datasourceValue,
    _.pick(queryValues, ['database', 'table', 'time_field', 'range', 'query', 'query_builder_filter', 'syntax']),
    refreshFlag,
  ]);
  // Freeze relative time bounds for the cache scope, including explicit refreshes.
  const statsRange = React.useMemo(() => (queryValues?.range ? parseRange(queryValues.range) : undefined), [statsCacheKey]);
  const queryField = (record: Field, funcs: string[]) => {
    if (!statsRange) return Promise.reject(new Error('Missing time range'));
    return getCKLogsQuery({
      cate: DatasourceCateEnum.ck,
      datasource_id: datasourceValue,
      query: funcs.map((func) => ({
        database: queryValues.database,
        table: queryValues.table,
        time_field: queryValues.time_field,

        query_builder_filter: queryValues.query_builder_filter,
        from: moment(statsRange.start).unix(),
        to: moment(statsRange.end).unix(),
        field: record.field,
        func,
        ref: func,
      })),
    } as any);
  };

  return (
    <div className='h-full flex flex-col flex-shrink-0'>
      <FieldsList
        helpCapabilities={{ stack: true }}
        typeMap={fieldTypeMap}
        loading={loading}
        organizeFieldNames={organizeFields}
        disableEmptyValueClick={false}
        onOperClick={(field, type) => {
          if (type === 'show') {
            setOrganizeFields(
              _.filter(organizeFields, (item) => {
                return item !== field;
              }),
            );
          } else if (type === 'available') {
            setOrganizeFields(_.uniq(_.concat(organizeFields, [field])));
          }
        }}
        fields={data}
        onValueFilter={
          queryValues?.syntax === 'sql'
            ? undefined
            : (params) => {
                onValueFilter({
                  ...params,
                  assignmentOperator: '=',
                  operator: params.operator === 'and' ? 'AND' : 'NOT',
                });
              }
        }
        statsCacheKey={statsCacheKey}
        fetchUniqueCount={async (record) => {
          const result = await queryField(record, ['unique_count']);
          return parseUniqueCount(result.list.find((item) => item.ref === 'unique_count')?.unique_count);
        }}
        fetchStats={async (record) => {
          try {
            const field = _.find(data, { field: record.field });
            let funcs = ['exist_ratio', 'unique_count', 'max', 'min', 'avg', 'median', 'p95', 'sum', 'top5'];
            if (!isCKNumberType(record.type, field?.normalized_type)) {
              funcs = ['exist_ratio', 'unique_count', 'top5'];
            }
            const result = await queryField(record, funcs);
            const top5Result = _.filter(result.list, (item) => {
              return item.ref === 'top5';
            });
            const statsResult = _.map(
              _.filter(result.list, (item) => {
                return item.ref !== 'top5';
              }),
              (item) => {
                const statName = item.ref;
                const statValue = _.toNumber(item?.[item.ref]);
                if (!_.isNaN(statValue) && _.isNumber(statValue)) {
                  return {
                    [statName]: format(statValue, {
                      type: 'si',
                      decimals: 2,
                    }).text,
                  };
                } else {
                  return {
                    [statName]: '-',
                  };
                }
              },
            );

            return {
              uniqueCount: parseUniqueCount(result.list.find((item) => item.ref === 'unique_count')?.unique_count),
              topN: _.map(top5Result, (item) => {
                return {
                  value: item[record.field],
                  percent: _.toNumber(item.ratio),
                  count: _.toNumber(item.count),
                };
              }),
              stats: _.reduce(
                statsResult,
                (result, item) => {
                  return {
                    ...result,
                    ...item,
                  };
                },
                {},
              ) as any,
            };
          } catch (error) {
            return {
              topN: [],
              stats: {},
            };
          }
        }}
        renderStatsPopoverTitleExtra={({ index, getUniqueCount, statsScope, setTopNVisible }) => {
          const active = stackByField === index.field;
          const title = t(active ? 'query.stack_tip_unpin' : 'query.stack_tip_pin');
          return (
            <Space>
              <FieldStackButton
                active={active}
                title={title}
                icon={<PinIcon className='text-[14px]' />}
                getUniqueCount={getUniqueCount}
                statsScope={statsScope}
                onChange={() => {
                  setStackByField(active ? undefined : index.field);
                  setTopNVisible(false);
                }}
              />
            </Space>
          );
        }}
        onStatisticClick={(type, options) => {
          const range = parseRange(queryValues.range);

          getCKSQLsPreview({
            cate: DatasourceCateEnum.ck,
            datasource_id: datasourceValue,
            query: [
              {
                database: queryValues.database,
                table: queryValues.table,
                time_field: queryValues.time_field,
                from: moment(range.start).valueOf(),
                to: moment(range.end).valueOf(),
                query_builder_filter: queryValues.query_builder_filter,
                field: options.field,
                func: options.func,
                field_filter: options.field_filter,
                ref: options.ref,
                group_by: options.group_by,
              },
            ],
          }).then((res) => {
            if (type === 'table') {
              const sqlPreviewData = res.table;
              if (!sqlPreviewData) return;
              const sqlTimeSeriesData = res.timeseries?.[options.func];
              form.setFieldsValue({
                refreshFlag: undefined,
                query: {
                  syntax: 'sql',
                  sqlVizType: 'table',
                  sql: sqlPreviewData.sql,
                  keys: {
                    valueKey: sqlTimeSeriesData?.value_key ?? [],
                    labelKey: sqlTimeSeriesData?.label_key ?? [],
                  },
                },
              });
              executeQuery();
            } else if (type === 'timeseries') {
              const sqlPreviewData = res.timeseries?.[options.func];
              if (sqlPreviewData) {
                form.setFieldsValue({
                  refreshFlag: undefined,
                  query: {
                    syntax: 'sql',
                    sqlVizType: 'timeseries',
                    sql: sqlPreviewData.sql,
                    keys: {
                      valueKey: sqlPreviewData.value_key ?? [],
                      labelKey: sqlPreviewData.label_key ?? [],
                    },
                  },
                });
                executeQuery();
              } else {
                message.error(t('query.generate_sql_failed'));
              }
            }
          });
        }}
      />
    </div>
  );
}
