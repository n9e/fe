import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Button, Form, Space, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import FieldsList, { Field } from '@/pages/explorer/components/FieldsList';
import { format } from '@/pages/dashboard/Renderer/utils/byteConverter';

import { getDorisLogsQuery } from '../../../services';
import { NAME_SPACE, TYPE_MAP } from '../../../constants';

import { setPinIndexToLocalstorage, setDefaultSearchIndexToLocalstorage } from '../../utils';
import { PinIcon, UnPinIcon } from './PinIcon';
import { DefaultSearchIcon, UnDefaultSearchIcon } from './DefaultSearchIcon';

interface IProps {
  organizeFields: string[];
  data: Field[];
  loading: boolean;
  onValueFilter: (parmas: { key: string; value: any; operator: 'AND' | 'NOT' }) => void;
  setOptions: (options: { organizeFields: string[] }) => void;
  pinIndex?: Field;
  setPinIndex: React.Dispatch<React.SetStateAction<Field | undefined>>;
  defaultSearchIndex?: Field;
  setDefaultSearchIndex: React.Dispatch<React.SetStateAction<Field | undefined>>;
}

export default function index(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { organizeFields, data, loading, onValueFilter, setOptions, pinIndex, setPinIndex, defaultSearchIndex, setDefaultSearchIndex } = props;
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch('query');

  return (
    <div className='h-full flex flex-col w-[200px] flex-shrink-0'>
      <FieldsList
        loading={loading}
        organizeFieldNames={organizeFields}
        onOperClick={(field, type) => {
          if (type === 'show') {
            setOptions({
              organizeFields: _.filter(organizeFields, (item) => {
                return item !== field;
              }),
            });
          } else if (type === 'available') {
            setOptions({
              organizeFields: _.uniq(_.concat(organizeFields, [field])),
            });
          }
        }}
        fields={data}
        onValueFilter={(params) => {
          onValueFilter({
            ...params,
            operator: params.operator === 'and' ? 'AND' : 'NOT',
          });
        }}
        fetchStats={async (record) => {
          try {
            const range = parseRange(queryValues.range);
            let funcs = ['unique_count', 'max', 'min', 'avg', 'sum', 'top5'];
            if (TYPE_MAP[record.type] !== 'number') {
              funcs = ['unique_count', 'top5'];
            }
            const requestParams = {
              cate: DatasourceCateEnum.doris,
              datasource_id: datasourceValue,
              query: _.map(funcs, (func) => {
                return {
                  database: queryValues.database,
                  table: queryValues.table,
                  time_field: queryValues.time_field,
                  query: queryValues.query,
                  from: moment(range.start).unix(),
                  to: moment(range.end).unix(),
                  field: record.field,
                  func,
                  ref: func,
                  default_field: defaultSearchIndex?.field,
                };
              }),
            };
            const result = await getDorisLogsQuery(requestParams as any);
            const top5Result = _.filter(result.list, (item) => {
              return item.ref === 'top5';
            });
            const statsResult = _.map(
              _.filter(result.list, (item) => {
                return item.ref !== 'top5';
              }),
              (item) => {
                const statName = item.ref;
                const statValue = item?.[item.ref];
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
                  if (_.keys(item)[0] === 'approx_distinct_cnt') {
                    return {
                      ...result,
                      unique_count: item['approx_distinct_cnt'],
                    };
                  }
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
              {defaultSearchIndex && defaultSearchIndex.field === index.field ? (
                <Tooltip title={t('query.default_search_tip_2')}>
                  <Button
                    icon={<UnDefaultSearchIcon className='text-[14px]' />}
                    type='text'
                    size='small'
                    onClick={() => {
                      setDefaultSearchIndex(undefined);
                      setDefaultSearchIndexToLocalstorage(
                        {
                          datasourceValue,
                          database: queryValues?.database,
                          table: queryValues?.table,
                        },
                        undefined,
                      );
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
                      setDefaultSearchIndex(index);
                      setDefaultSearchIndexToLocalstorage(
                        {
                          datasourceValue,
                          database: queryValues?.database,
                          table: queryValues?.table,
                        },
                        index,
                      );
                      setTopNVisible(false);
                    }}
                  />
                </Tooltip>
              )}
              {pinIndex && pinIndex.field === index.field ? (
                <Tooltip title={disabled ? t('query.stack_disabled_tip') : t('query.stack_tip_unpin')}>
                  <Button
                    icon={<UnPinIcon className='text-[14px]' />}
                    type='text'
                    size='small'
                    onClick={() => {
                      setPinIndex(undefined);
                      setPinIndexToLocalstorage(
                        {
                          datasourceValue,
                          database: queryValues?.database,
                          table: queryValues?.table,
                        },
                        undefined,
                      );
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
                      setPinIndex(index);
                      setPinIndexToLocalstorage(
                        {
                          datasourceValue,
                          database: queryValues?.database,
                          table: queryValues?.table,
                        },
                        index,
                      );
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
              {defaultSearchIndex && defaultSearchIndex.field === field.field && (
                <Tooltip title={t('query.default_search_by_tip')}>
                  <DefaultSearchIcon
                    className='text-[12px]'
                    style={{
                      color: 'var(--fc-primary-color)',
                    }}
                  />
                </Tooltip>
              )}
              {pinIndex && pinIndex.field === field.field && (
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
