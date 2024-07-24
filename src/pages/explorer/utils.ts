import _ from 'lodash';
import { isMathString, IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import moment from 'moment';
interface FormValue {
  datasourceCate: string;
  datasourceValue: number;
  query: {
    [index: string]: string | IRawTimeRange | null | undefined;
  };
}

/**
 * 从 URL query 中获取 filter
 * 存在 query_string 时直接作为 filter 值
 * 否则排查掉 data_source_name, data_source_id, index_name, timestamp, index_pattern 之后的参数合并为 filter
 * 合并后的 filter 为 AND 关系
 */

const getESFilterByQuery = (query: { [index: string]: string | null }) => {
  if (query?.query_string) {
    return query?.query_string;
  } else {
    const filtersArr: string[] = [];
    const validParmas = _.omit(query, ['data_source_name', 'data_source_id', 'index_name', 'timestamp', 'index_pattern', 'start', 'end', 'mode']);
    _.forEach(validParmas, (value, key) => {
      if (value) {
        filtersArr.push(`${key}:"${value}"`);
      }
    });
    return _.join(filtersArr, ' AND ');
  }
};

export const getFormValuesBySearch = (params: { [index: string]: string | null }) => {
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
    const queryString = _.get(params, 'query') || undefined;
    if (data_source_name === 'aliyun-sls') {
      const project = _.get(params, 'project');
      const logstore = _.get(params, 'logstore');
      const range_start = _.get(params, 'start');
      const range_end = _.get(params, 'end');
      const defaultRange =
        range_start && range_end
          ? { start: !isMathString(range_start) ? moment(Number(range_start)) : range_start, end: !isMathString(range_end) ? moment(Number(range_end)) : range_end }
          : undefined;
      if (project && logstore) {
        return {
          ...formValues,
          query: {
            project,
            logstore,
            query: queryString,
            range: defaultRange,
          },
        };
      }
    }
    if (data_source_name === 'tencent-cls') {
      const logset_id = _.get(params, 'logset_id');
      const topic_id = _.get(params, 'topic_id');
      if (logset_id && topic_id) {
        return {
          ...formValues,
          query: {
            logset_id,
            topic_id,
            query: queryString,
          },
        };
      }
    }
    if (data_source_name === 'elasticsearch') {
      const index = _.get(params, 'index_name');
      const indexPattern = _.get(params, 'index_pattern');
      const timestamp = _.get(params, 'timestamp', '@timestamp');
      const range_start = _.get(params, 'start');
      const range_end = _.get(params, 'end');
      const defaultRange =
        range_start && range_end
          ? { start: !isMathString(range_start) ? moment(Number(range_start)) : range_start, end: !isMathString(range_end) ? moment(Number(range_end)) : range_end }
          : undefined;
      if (index) {
        return {
          ...formValues,
          query: {
            index,
            filter: getESFilterByQuery(params),
            date_field: timestamp,
            range: defaultRange,
          },
        };
      } else if (indexPattern) {
        return {
          ...formValues,
          query: {
            filter: getESFilterByQuery(params),
            indexPattern,
            range: defaultRange,
          },
        };
      }
    }
    if (data_source_name === 'loki') {
      const query = _.get(params, 'query');
      const limit = _.get(params, 'limit');
      if (query) {
        return {
          ...formValues,
          query: {
            query,
            limit,
          },
        };
      }
    }
    if (data_source_name === 'doris') {
      const range_start = _.get(params, 'start');
      const range_end = _.get(params, 'end');
      const defaultRange =
        range_start && range_end
          ? { start: !isMathString(range_start) ? moment(Number(range_start)) : range_start, end: !isMathString(range_end) ? moment(Number(range_end)) : range_end }
          : undefined;
      return {
        ...formValues,
        query: {
          condition: _.get(params, 'condition'),
          time_field: _.get(params, 'time_field'),
          range: defaultRange,
        },
      };
    }
  }
  return undefined;
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
        const omitedFormValuesQuery = _.omit(formValues.query, ['query', 'range'])
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
  const formValues = getFormValuesBySearch(params);
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
  const formValues = getFormValuesBySearch(params);
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
