import React from 'react';
import _ from 'lodash';
import { Form } from 'antd';
import semver from 'semver';
import moment from 'moment';

import { parseRange } from '@/components/TimeRangePicker';
import FieldsList, { Field } from '@/pages/logExplorer/components/FieldsList';

import { HandleValueFilterParams } from '../../types';
import { getESVersion, getFieldValues } from '../../../services';
import dslBuilder from '../../../utils/dslBuilder';

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
  const queryValues = Form.useWatch('query');
  const { from, range, limit } = requestParams;

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
          console.log('fetchStats', record);
          try {
            const queryValues = form.getFieldValue('query');
            const parsedRange = parseRange(queryValues.range);

            console.log('queryValues', queryValues, parsedRange);
            const timeParams = range
              ? range
              : {
                  from: moment(parsedRange.start).valueOf(),
                  to: moment(parsedRange.end).valueOf(),
                };

            console.log('timeParams', timeParams);
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
                query_string: queryValues.filter,
                kuery: queryValues.filter,
                from,
                limit,
                fields: [ajustFieldParamValue(record, version)],
              }),
              ajustFieldParamValue(record, version),
              5,
            );
            return {
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
              topN: [],
            };
          }
        }}
      />
    </div>
  );
}
