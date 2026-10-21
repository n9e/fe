import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Button, Form, message, Space, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import FieldsList, { Field } from '@/pages/logExplorer/components/FieldsList';
import FieldStackButton from '@/pages/logExplorer/components/FieldsList/FieldStackButton';
import { parseUniqueCount } from '@/pages/logExplorer/components/FieldsList/useFieldStatsCache';
import { format } from '@/pages/dashboard/Renderer/utils/byteConverter';

import { HandleValueFilterParams } from '../../types';
import { getDorisLogsQuery, getDorisSQLsPreview } from '../../../services';
import { NAME_SPACE, TYPE_MAP } from '../../../constants';
import { PinIcon } from './PinIcon';
import { DefaultSearchIcon } from './DefaultSearchIcon';

interface IProps {
  organizeFields: string[];
  setOrganizeFields: (newOrganizeFields: string[]) => void;
  data: Field[];
  loading: boolean;
  onValueFilter: HandleValueFilterParams;
  executeQuery: () => void;

  stackByField?: string;
  setStackByField: (field?: string) => void;
  defaultSearchField?: string;
  setDefaultSearchField: (field?: string) => void;
}

export default function index(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { organizeFields, setOrganizeFields, data, loading, onValueFilter, executeQuery, stackByField, setStackByField, defaultSearchField, setDefaultSearchField } = props;
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch('query');
  const refreshFlag = Form.useWatch('refreshFlag');
  const statsCacheKey = JSON.stringify([
    datasourceValue,
    _.pick(queryValues, ['database', 'table', 'time_field', 'range', 'query', 'query_builder_filter', 'syntax']),
    defaultSearchField,
    refreshFlag,
  ]);
  // Freeze relative time bounds for the cache scope, including explicit refreshes.
  const statsRange = React.useMemo(() => (queryValues?.range ? parseRange(queryValues.range) : undefined), [statsCacheKey]);
  const queryField = (record: Field, funcs: string[]) => {
    if (!statsRange) return Promise.reject(new Error('Missing time range'));
    return getDorisLogsQuery({
      cate: DatasourceCateEnum.doris,
      datasource_id: datasourceValue,
      query: funcs.map((func) => ({
        database: queryValues.database,
        table: queryValues.table,
        time_field: queryValues.time_field,
        query: queryValues.query,
        query_builder_filter: queryValues.query_builder_filter,
        from: moment(statsRange.start).valueOf(),
        to: moment(statsRange.end).valueOf(),
        field: record.field,
        func,
        ref: func,
        default_field: defaultSearchField,
      })),
    } as any);
  };

  return (
    <div className='h-full flex flex-col flex-shrink-0'>
      <FieldsList
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
            let funcs = ['exist_ratio', 'unique_count', 'max', 'min', 'avg', 'median', 'p95', 'sum', 'top5'];
            if (TYPE_MAP[record.type] !== 'number') {
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
          const searchActive = defaultSearchField === index.field;
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
              <Tooltip mouseEnterDelay={0.6} title={t(searchActive ? 'query.default_search_tip_2' : 'query.default_search_tip_1')}>
                <Button
                  aria-label={t(searchActive ? 'query.default_search_tip_2' : 'query.default_search_tip_1')}
                  aria-pressed={searchActive}
                  className={searchActive ? 'n9e-log-field-search-active' : undefined}
                  icon={<DefaultSearchIcon className='text-[14px]' />}
                  type='text'
                  size='small'
                  onClick={() => {
                    setDefaultSearchField(searchActive ? undefined : index.field);
                    setTopNVisible(false);
                  }}
                />
              </Tooltip>
            </Space>
          );
        }}
        onStatisticClick={(type, options) => {
          const range = parseRange(queryValues.range);

          getDorisSQLsPreview({
            cate: DatasourceCateEnum.doris,
            datasource_id: datasourceValue,
            query: [
              {
                database: queryValues.database,
                table: queryValues.table,
                time_field: queryValues.time_field,
                default_field: defaultSearchField,
                from: moment(range.start).valueOf(),
                to: moment(range.end).valueOf(),
                query: queryValues.query,
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
              let sqlPreviewData = res.timeseries?.[options.func];
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
