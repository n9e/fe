import _ from 'lodash';
import moment from 'moment';
import queryString from 'query-string';

import { DatasourceCateEnum } from '@/utils/constant';
import { isMathString, IRawTimeRange } from '@/components/TimeRangePicker';

export default function getFormValuesBySearchParams(params: { [index: string]: string | null }) {
  const data_source_name = _.get(params, 'data_source_name');
  const data_source_id = _.get(params, 'data_source_id');
  const query = _.get(params, 'query') || undefined;

  if (data_source_name && data_source_id) {
    const formValues: {
      datasourceCate: string;
      datasourceValue: number;
    } = {
      datasourceCate: data_source_name,
      datasourceValue: _.toNumber(data_source_id),
    };
    const range_start = _.get(params, 'start');
    const range_end = _.get(params, 'end');
    const range =
      range_start && range_end
        ? { start: !isMathString(range_start) ? moment(Number(range_start)) : range_start, end: !isMathString(range_end) ? moment(Number(range_end)) : range_end }
        : undefined;

    if (data_source_name === DatasourceCateEnum.doris) {
      const navMode = _.get(params, 'navMode');
      const syntax = _.get(params, 'syntax');
      const sqlVizType = _.get(params, 'sqlVizType');
      const database = _.get(params, 'database');
      const table = _.get(params, 'table');
      const time_field = _.get(params, 'time_field');
      const stackByField = _.get(params, 'stackByField');
      const defaultSearchField = _.get(params, 'defaultSearchField');
      const sql = _.get(params, 'sql');
      const labelKey = _.get(params, 'labelKey');
      const valueKey = _.get(params, 'valueKey');

      return {
        ...formValues,
        query: {
          range,
          navMode,
          syntax,
          sqlVizType,
          database,
          table,
          time_field,
          stackByField,
          defaultSearchField,
          query,
          sql,
          keys: {
            labelKey,
            valueKey,
          },
        },
      };
    }
  }
  return undefined;
}

interface FormValue {
  datasourceCate: string;
  datasourceValue: number;
  query: {
    [index: string]: any;
  };
}

export function getLocationSearchByFormValues(formValues: FormValue) {
  const data_source_name = formValues.datasourceCate;
  const data_source_id = formValues.datasourceValue;
  const query: any = {
    data_source_name,
    data_source_id,
  };
  const range = formValues.query?.range as IRawTimeRange;
  if (moment.isMoment(range?.start) && moment.isMoment(range?.end)) {
    query.start = range.start.valueOf();
    query.end = range.end.valueOf();
  } else if (isMathString(range?.start) && isMathString(range?.end)) {
    query.start = range.start;
    query.end = range.end;
  }
  if (data_source_name === DatasourceCateEnum.doris) {
    query.navMode = formValues.query?.navMode;
    query.syntax = formValues.query?.syntax;
    query.sqlVizType = formValues.query?.sqlVizType;
    query.database = formValues.query?.database;
    query.table = formValues.query?.table;
    query.time_field = formValues.query?.time_field;
    query.stackByField = formValues.query?.stackByField;
    query.defaultSearchField = formValues.query?.defaultSearchField;
    query.query = formValues.query?.query;
    query.sql = formValues.query?.sql;
    query.labelKey = formValues.query?.keys?.labelKey;
    query.valueKey = formValues.query?.keys?.valueKey;
    return queryString.stringify(query);
  }
  return '';
}
