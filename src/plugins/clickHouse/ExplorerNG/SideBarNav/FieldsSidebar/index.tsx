import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Button, Form, Space, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import FieldsList from '@/pages/logExplorer/components/FieldsList';
import { format } from '@/pages/dashboard/Renderer/utils/byteConverter';

import { Field, HandleValueFilterParams } from '../../types';
import { getCKLogsQuery } from '../../../services';
import { getCKFieldIconType, isCKNumberType, NAME_SPACE } from '../../../constants';
import { PinIcon, UnPinIcon } from './PinIcon';
import { DefaultSearchIcon, UnDefaultSearchIcon } from './DefaultSearchIcon';

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

  return (
    <div className='h-full flex flex-col flex-shrink-0'>
      <FieldsList
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
        fetchStats={async (record) => {
          try {
            const range = parseRange(queryValues.range);
            const field = _.find(data, { field: record.field });
            let funcs = ['exist_ratio', 'unique_count', 'max', 'min', 'avg', 'median', 'p95', 'sum', 'top5'];
            if (!isCKNumberType(record.type, field?.normalized_type)) {
              funcs = ['exist_ratio', 'unique_count', 'top5'];
            }
            const requestParams = {
              cate: DatasourceCateEnum.ck,
              datasource_id: datasourceValue,
              query: _.map(funcs, (func) => {
                return {
                  database: queryValues.database,
                  table: queryValues.table,
                  time_field: queryValues.time_field,
                  query_builder_filter: queryValues.query_builder_filter,
                  from: moment(range.start).unix(),
                  to: moment(range.end).unix(),
                  field: record.field,
                  func,
                  ref: func,
                };
              }),
            };
            const result = await getCKLogsQuery(requestParams as any);
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
        renderStatsPopoverTitleExtra={({ index, stats, setTopNVisible }) => {
          const unique_count = stats?.unique_count !== undefined ? _.toNumber(stats.unique_count) : 0;
          const disabled = _.isNaN(unique_count) || unique_count <= 1 || unique_count > 10;
          return (
            <Space>
              {defaultSearchField && defaultSearchField === index.field ? (
                <Tooltip title={t('query.default_search_tip_2')}>
                  <Button
                    icon={<UnDefaultSearchIcon className='text-[14px]' />}
                    type='text'
                    size='small'
                    onClick={() => {
                      setDefaultSearchField(undefined);
                      setTopNVisible(false);
                    }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title={t('query.default_search_tip_1')}>
                  <Button
                    icon={<DefaultSearchIcon className='text-[14px]' />}
                    type='text'
                    size='small'
                    onClick={() => {
                      setDefaultSearchField(index.field);
                      setTopNVisible(false);
                    }}
                  />
                </Tooltip>
              )}
              {stackByField && stackByField === index.field ? (
                <Tooltip title={disabled ? t('query.stack_disabled_tip') : t('query.stack_tip_unpin')}>
                  <Button
                    icon={<UnPinIcon className='text-[14px]' />}
                    type='text'
                    size='small'
                    onClick={() => {
                      setStackByField(undefined);
                      setTopNVisible(false);
                    }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title={disabled ? t('query.stack_disabled_tip') : t('query.stack_tip_pin')}>
                  <Button
                    disabled={disabled}
                    icon={<PinIcon className='text-[14px]' />}
                    type='text'
                    size='small'
                    onClick={() => {
                      setStackByField(index.field);
                      setTopNVisible(false);
                    }}
                  />
                </Tooltip>
              )}
            </Space>
          );
        }}
        renderFieldNameExtra={(field) => {
          return (
            <Space size={2}>
              {defaultSearchField && defaultSearchField === field.field && (
                <Tooltip title={t('query.default_search_by_tip')}>
                  <DefaultSearchIcon
                    className='text-[12px]'
                    style={{
                      color: 'var(--fc-primary-color)',
                    }}
                  />
                </Tooltip>
              )}
              {stackByField && stackByField === field.field && (
                <Tooltip title={t('query.stack_group_by_tip')}>
                  <PinIcon
                    className='text-[12px]'
                    style={{
                      color: 'var(--fc-primary-color)',
                    }}
                  />
                </Tooltip>
              )}
            </Space>
          );
        }}
      />
    </div>
  );
}
