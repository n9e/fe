import React from 'react';
import _ from 'lodash';
import { Form } from 'antd';
import semver from 'semver';
import moment from 'moment';

import { parseRange } from '@/components/TimeRangePicker';
import FieldsList, { Field } from '@/pages/logExplorer/components/FieldsList';

import { LOGS_OPTIONS_CACHE_KEY } from '../../../constants';
import { getESVersion, getFieldValues } from '../../../services';
import dslBuilder from '../../../utils/dslBuilder';
import { getOptionsFromLocalstorage } from '../../utils/optionsLocalstorage';
import { HandleValueFilterParams } from '../../types';

interface IProps {
  organizeFields: string[];
  setOrganizeFields: (newOrganizeFields: string[]) => void;
  data: Field[];
  loading: boolean;
  onValueFilter: HandleValueFilterParams;
  executeQuery: () => void;
  requestParams: {
    range?: {
      from: number;
      to: number;
    };
    from: number;
    limit: number;
    reverse: boolean;
  };
}

export function ajustFieldParamValue(field: Field, version: string) {
  if (semver.lt(version, '7.10.0') && field.type === 'text') {
    return `${field.field}.keyword`;
  }
  return field.field;
}

export default function index(props: IProps) {
  const { organizeFields, setOrganizeFields, data, loading, onValueFilter, executeQuery, requestParams } = props;
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const { from, range, limit, reverse } = requestParams;

  return (
    <div className='h-full flex flex-col flex-shrink-0'>
      <FieldsList
        loading={loading}
        organizeFieldNames={organizeFields}
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
        onValueFilter={(params) => {
          onValueFilter({
            ...params,
            assignmentOperator: '=',
            operator: params.operator === 'and' ? 'AND' : 'NOT',
          });
        }}
        fetchStats={async (record) => {
          const options = getOptionsFromLocalstorage(LOGS_OPTIONS_CACHE_KEY);
          const topNumber = options.topNumber ?? 5;

          try {
            const queryValues = form.getFieldValue('query');
            const parsedRange = parseRange(queryValues.range);

            const timeParams = range
              ? range
              : {
                  from: moment(parsedRange.start).valueOf(),
                  to: moment(parsedRange.end).valueOf(),
                };

            const version = await getESVersion(datasourceValue);
            const topN = await getFieldValues(
              datasourceValue,
              dslBuilder({
                start: timeParams.from,
                end: timeParams.to,
                version,
                index: queryValues.index,
                date_field: queryValues.date_field,
                filters: queryValues.filters,
                syntax: queryValues.syntax,
                query_string: queryValues.query,
                kuery: queryValues.query,
                from,
                limit,
                sorter: [
                  {
                    field: queryValues.date_field,
                    order: reverse ? 'desc' : 'asc',
                  },
                ],
                fields: [ajustFieldParamValue(record, version)],
              }),
              ajustFieldParamValue(record, version),
              topNumber,
            );
            return {
              topNumber,
              topN: _.map(topN, (item) => {
                return {
                  percent: _.floor(item.value * 100, 2),
                  value: item.label,
                };
              }),
            };
          } catch (e) {
            console.error(e);
            return {
              topNumber,
              topN: [],
            };
          }
        }}
      />
    </div>
  );
}
