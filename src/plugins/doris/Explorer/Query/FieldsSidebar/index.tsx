import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Form } from 'antd';

import { DatasourceCateEnum } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import FieldsList, { Field } from '@/pages/explorer/components/FieldsList';
import { format } from '@/pages/dashboard/Renderer/utils/byteConverter';

import { getDorisLogsQuery } from '../../../services';
import { TYPE_MAP } from '../../../constants';

interface IProps {
  organizeFields: string[];
  data: Field[];
  loading: boolean;
  onValueFilter: (parmas: { key: string; value: any; operator: 'AND' | 'NOT' }) => void;
  setOptions: (options: { organizeFields: string[] }) => void;
}

export default function index(props: IProps) {
  const { organizeFields, data, loading, onValueFilter, setOptions } = props;
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
      />
    </div>
  );
}
