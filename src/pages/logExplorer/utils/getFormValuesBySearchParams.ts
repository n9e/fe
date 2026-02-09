import _ from 'lodash';
import moment from 'moment';
import queryString from 'query-string';

import { DatasourceCateEnum } from '@/utils/constant';
import { isMathString, IRawTimeRange } from '@/components/TimeRangePicker';

/**
 * 从 URL query 中获取 filter
 * 存在 query || query_string 时直接作为 filter 值
 * 否则排查掉 data_source_name, data_source_id, index_name, timestamp, index_pattern 之后的参数合并为 filter
 * 合并后的 filter 为 AND 关系
 */

const getESFilterByQuery = (query: { [index: string]: string | null }) => {
  if (query?.query) {
    return query?.query;
    // @deprecated 2024-11-26 未来会废弃，后面标准化为 query
  } else if (query?.query_string) {
    return query?.query_string;
  } else {
    // @deprecated 2024-11-26 未来会废弃，后面标准化为 query
    const filtersArr: string[] = [];
    const validParmas = _.omit(query, [
      'data_source_name',
      'data_source_id',
      'index',
      'index_name',
      'date_field',
      'timestamp',
      'index_pattern',
      'start',
      'end',
      'mode',
      'syntax',
      'query',
      '__execute__',
      'filters',
      'allow_hide_system_indices',
    ]);
    _.forEach(validParmas, (value, key) => {
      if (value) {
        filtersArr.push(`${key}:"${value}"`);
      }
    });
    return _.join(filtersArr, ' AND ');
  }
};

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
      const labelKey = _.get(params, 'labelKey') ?? [];
      const valueKey = _.get(params, 'valueKey') ?? [];

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
            labelKey: _.isArray(labelKey) ? labelKey : [labelKey],
            valueKey: _.isArray(valueKey) ? valueKey : [valueKey],
          },
        },
      };
    }
    if (data_source_name === DatasourceCateEnum.aliyunSLS) {
      const mode = _.get(params, 'mode');
      const submode = _.get(params, 'submode');
      const project = _.get(params, 'project');
      const logstore = _.get(params, 'logstore');
      const power_sql = _.get(params, 'power_sql') === 'true' ? true : false;
      const labelKey = _.get(params, 'labelKey') ?? [];
      const valueKey = _.get(params, 'valueKey') ?? [];
      const timeKey = _.get(params, 'timeKey') ?? '';
      const timeFormat = _.get(params, 'timeFormat') ?? '';
      if (project && logstore) {
        return {
          ...formValues,
          query: {
            range,
            mode,
            submode,
            project,
            logstore,
            query,
            power_sql,
            keys: {
              labelKey: _.isArray(labelKey) ? labelKey : [labelKey],
              valueKey: _.isArray(valueKey) ? valueKey : [valueKey],
              timeKey,
              timeFormat,
            },
          },
        };
      }
    }
    if (data_source_name === DatasourceCateEnum.elasticsearch) {
      // @deprecated 2024-11-26 标准参数名为 index 同时兼容 index_name
      const index = _.get(params, 'index') || _.get(params, 'index_name');
      const index_pattern = _.get(params, 'index_pattern');
      // @deprecated 2024-11-26 标准参数名为 date_field 同时兼容 timestamp
      const date_field = _.get(params, 'date_field') || _.get(params, 'timestamp', '@timestamp');
      const syntax = _.get(params, 'syntax');
      const mode = _.get(params, 'mode');
      const allow_hide_system_indices = _.get(params, 'allow_hide_system_indices') === 'true' ? true : false;
      let filters: any[] = [];
      try {
        if (params?.filters) {
          const parsedFilters = JSON.parse(params.filters);
          if (_.isArray(parsedFilters)) {
            filters = parsedFilters;
          }
        }
      } catch (error) {
        console.error('Failed to parse filters from URL params', error);
      }

      if (mode === 'index-patterns' || index_pattern) {
        return {
          ...formValues,
          query: {
            mode: 'index-patterns',
            index_pattern: _.toNumber(index_pattern),
            query: getESFilterByQuery(params),
            date_field,
            range,
            syntax,
            allow_hide_system_indices,
            filters,
          },
        };
      } else if (index) {
        return {
          ...formValues,
          query: {
            mode: 'indices',
            index,
            query: getESFilterByQuery(params),
            date_field,
            range,
            syntax,
            allow_hide_system_indices,
            filters,
          },
        };
      }
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
  if (data_source_name === DatasourceCateEnum.aliyunSLS) {
    query.mode = formValues.query?.mode;
    query.submode = formValues.query?.submode;
    query.project = formValues.query?.project;
    query.logstore = formValues.query?.logstore;
    query.query = formValues.query?.query;
    query.power_sql = formValues.query?.power_sql;
    query.labelKey = formValues.query?.keys?.labelKey;
    query.valueKey = formValues.query?.keys?.valueKey;
    query.timeKey = formValues.query?.keys?.timeKey;
    query.timeFormat = formValues.query?.keys?.timeFormat;
    return queryString.stringify(query);
  }
  if (data_source_name === DatasourceCateEnum.elasticsearch) {
    let filtersString = '';
    const filters = formValues.query?.filters;
    if (filters && _.isArray(filters) && filters.length > 0) {
      try {
        filtersString = JSON.stringify(filters);
      } catch (error) {
        console.error('Failed to stringify filters for URL params', error);
      }
    }

    query.mode = formValues.query?.mode;
    query.index = formValues.query?.index;
    query.index_pattern = formValues.query?.index_pattern;
    query.date_field = formValues.query?.date_field;
    query.syntax = formValues.query?.syntax;
    query.query = formValues.query?.query;
    query.allow_hide_system_indices = formValues.query?.allow_hide_system_indices ? 'true' : 'false';
    query.filters = filtersString;
    return queryString.stringify(query);
  }
  return '';
}
