import _ from 'lodash';
import moment from 'moment';
import queryString from 'query-string';
import { isMathString, IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { DatasourceCateEnum } from '@/utils/constant';

// @ts-ignore
import getPlusFormValuesByParams from 'plus:/parcels/Explorer/utils/getPlusFormValuesByParams';
// @ts-ignore
import getPlusLocationSearchByFormValues from 'plus:/parcels/Explorer/utils/getPlusLocationSearchByFormValues';

interface FormValue {
  datasourceCate: string;
  datasourceValue: number;
  query: {
    [index: string]: any;
  };
}

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
    ]);
    _.forEach(validParmas, (value, key) => {
      if (value) {
        filtersArr.push(`${key}:"${value}"`);
      }
    });
    return _.join(filtersArr, ' AND ');
  }
};

export const getFormValuesBySearchParams = (params: { [index: string]: string | null }) => {
  const data_source_name = _.get(params, 'data_source_name');
  const data_source_id = _.get(params, 'data_source_id');
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
    if (data_source_name === DatasourceCateEnum.elasticsearch) {
      // @deprecated 2024-11-26 标准参数名为 index 同时兼容 index_name
      const index = _.get(params, 'index') || _.get(params, 'index_name');
      const index_pattern = _.get(params, 'index_pattern');
      // @deprecated 2024-11-26 标准参数名为 date_field 同时兼容 timestamp
      const date_field = _.get(params, 'date_field') || _.get(params, 'timestamp', '@timestamp');
      const syntax = _.get(params, 'syntax');
      const mode = _.get(params, 'mode');

      if (mode === 'index-patterns' || index_pattern) {
        return {
          ...formValues,
          query: {
            mode: 'index-patterns',
            indexPattern: _.toNumber(index_pattern),
            filter: getESFilterByQuery(params),
            date_field,
            range,
            syntax,
          },
        };
      } else if (index) {
        return {
          ...formValues,
          query: {
            mode: 'indices',
            index,
            filter: getESFilterByQuery(params),
            date_field,
            range,
            syntax,
          },
        };
      }
    } else if (data_source_name === DatasourceCateEnum.loki) {
      const query = _.get(params, 'query');
      const limit = _.get(params, 'limit');
      if (query) {
        return {
          ...formValues,
          query: {
            query,
            limit,
            range,
          },
        };
      }
    } else if (data_source_name === DatasourceCateEnum.ck) {
      return {
        ...formValues,
        query: {
          query: queryString,
          range,
        },
      };
    } else {
      return getPlusFormValuesByParams(params);
    }
  }
  return undefined;
};

export const getLocationSearchByFormValues = (formValues: FormValue) => {
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
  if (data_source_name === DatasourceCateEnum.elasticsearch) {
    query.mode = formValues.query?.mode;
    query.index = formValues.query?.index;
    query.index_pattern = formValues.query?.indexPattern;
    query.date_field = formValues.query?.date_field;
    query.syntax = formValues.query?.syntax;
    query.query = formValues.query?.filter; // TODO 早期 ES 的 query 参数名被起名为 filter 这里就不单独处理了
    return queryString.stringify(query);
  } else if (data_source_name === DatasourceCateEnum.loki) {
    query.query = formValues.query?.query;
    query.limit = formValues.query?.limit;
    return queryString.stringify(query);
  } else if (data_source_name === DatasourceCateEnum.ck) {
    query.query = formValues.query?.query;
    return queryString.stringify(query);
  } else {
    return getPlusLocationSearchByFormValues(formValues);
  }
};

export const formValuesIsInItems = (
  formValues: FormValue,
  items: {
    key: string;
    isInited?: boolean;
    formValues?: FormValue;
  }[],
) => {
  return _.some(items, (item: any) => {
    const itemFormValues = item.formValues;
    if (itemFormValues?.datasourceCate === formValues.datasourceCate && itemFormValues?.datasourceValue === formValues.datasourceValue) {
      // sls、cls、loki 存在 query.query，如果 formValues.query.query 存在则也需要比较 query.query，否则排除 query.query 后比较
      if (formValues.query.query !== undefined) {
        return _.isEqual(_.omit(itemFormValues?.query, ['range']), _.omit(formValues.query, ['range']));
      }
      if (formValues.datasourceCate === 'es') {
        // es数据源区分index和indexPattern，无法严格equal，所以以缓存中的formValues.query中的keys为标准，逐个对比是否相等
        const omitedFormValuesQuery = _.omit(formValues.query, ['query', 'range']);
        const keys = _.keys(omitedFormValuesQuery);
        const pickedKeysItemFormValues = _.pick(itemFormValues?.query, keys);
        return _.isEqual(pickedKeysItemFormValues, omitedFormValuesQuery);
      }
      return _.isEqual(_.omit(itemFormValues?.query, ['query', 'range', 'index', 'date_field']), _.omit(formValues.query, ['query', 'range', 'index', 'date_field']));
    }
  });
};

export function getuuid() {
  return _.toString(new Date().getTime());
}

const localeKey = 'logs_explorer_items';
const defaultActiveKey = getuuid();
export const getLocalItems = (params) => {
  const localItems = localStorage.getItem(localeKey);
  let items: any[] = [];
  const range_start = _.get(params, 'start');
  const range_end = _.get(params, 'end');
  if (localItems) {
    try {
      items = _.map(JSON.parse(localItems), (item) => {
        let formValues = item.formValues || {};
        // 如果是绝对时间则设置默认值 last 1 hour
        if (!isMathString(formValues.query?.range?.start) || !isMathString(formValues.query?.range?.end)) {
          const parsed = parseRange({
            start: formValues.query?.range?.start,
            end: formValues.query?.range?.end,
          });
          if (parsed.start && parsed.end) {
            _.set(formValues, 'query.range', {
              start: parsed.start,
              end: parsed.end,
            });
          } else {
            _.set(formValues, 'query.range', {
              start: 'now-1h',
              end: 'now',
            });
          }
        }
        const searchRange =
          range_start && range_end
            ? { start: !isMathString(range_start) ? moment(Number(range_start)) : range_start, end: !isMathString(range_end) ? moment(Number(range_end)) : range_end }
            : undefined;
        if (searchRange) {
          _.set(item, 'formValues.query.range', searchRange);
        }
        return {
          ...item,
          isInited: false,
        };
      });
    } catch (e) {
      console.warn(e);
    }
  } else {
    const searchRange =
      range_start && range_end
        ? { start: !isMathString(range_start) ? moment(Number(range_start)) : range_start, end: !isMathString(range_end) ? moment(Number(range_end)) : range_end }
        : undefined;

    items = [
      {
        key: defaultActiveKey,
        isInited: false,
        formValues: searchRange ? { query: { range: searchRange } } : undefined,
      },
    ];
  }
  const formValues = getFormValuesBySearchParams(params);
  if (formValues) {
    if (formValuesIsInItems(formValues, items)) {
      const range_start = _.get(params, 'start');
      const range_end = _.get(params, 'end');
      const item = _.find(items, (item) => {
        return formValuesIsInItems(formValues, [item]);
      });

      const searchRange =
        range_start && range_end
          ? { start: !isMathString(range_start) ? moment(Number(range_start)) : range_start, end: !isMathString(range_end) ? moment(Number(range_end)) : range_end }
          : undefined;
      // 当命中缓存时，url search中的start和end 如存在，则优先级更高
      if (item && searchRange) {
        _.set(item, 'formValues.query.range', searchRange);
      }
    } else {
      items = [
        ...items,
        {
          key: getuuid(),
          isInited: false,
          formValues,
        },
      ];
    }
  }
  return items;
};

export const setLocalItems = (items: any) => {
  try {
    localStorage.setItem(
      localeKey,
      JSON.stringify(
        _.map(items, (item) => {
          return _.omit(item, ['isInited']);
        }),
      ),
    );
  } catch (e) {
    console.warn(e);
  }
};

const localeActiveKey = 'logs_explorer_items_active_key';
export const getLocalActiveKey = (params: { [index: string]: string | null }, items: any[]) => {
  let activeKey = localStorage.getItem(localeActiveKey);
  const formValues = getFormValuesBySearchParams(params);
  if (formValues) {
    const item = _.find(items, (item) => {
      return formValuesIsInItems(formValues, [item]);
    });
    if (item) {
      return item.key;
    }
  }
  if (activeKey) {
    const item = _.find(items, (item) => {
      return item.key === activeKey;
    });
    if (item) {
      return item.key;
    }
    return _.head(items)?.key;
  }
  if (items.length > 0) {
    return _.head(items)?.key;
  }
  return defaultActiveKey;
};

export const setLocalActiveKey = (activeKey: string) => {
  localStorage.setItem(localeActiveKey, activeKey);
};
