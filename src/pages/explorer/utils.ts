import _ from 'lodash';
import { isMathString } from '@/components/TimeRangePicker';

interface FormValue {
  datasourceCate: string;
  datasourceValue: number;
  query: {
    [index: string]: string | null | undefined;
  };
}

/**
 * 从 URL query 中获取 filter
 * 存在 query_string 时直接作为 filter 值
 * 否则排查掉 data_source_name, data_source_id, index_name, timestamp 之后的参数合并为 filter
 * 合并后的 filter 为 AND 关系
 */

const getESFilterByQuery = (query: { [index: string]: string | null }) => {
  if (query?.query_string) {
    return query?.query_string;
  } else {
    const filtersArr: string[] = [];
    const validParmas = _.omit(query, ['data_source_name', 'data_source_id', 'index_name', 'timestamp']);
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
      if (project && logstore) {
        return {
          ...formValues,
          query: {
            project,
            logstore,
            query: queryString,
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
      const timestamp = _.get(params, 'timestamp', '@timestamp');
      if (index) {
        return {
          ...formValues,
          query: {
            index,
            filter: getESFilterByQuery(params),
            date_field: timestamp,
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
      if (formValues.query.query !== undefined) {
        return _.isEqual(_.omit(itemFormValues?.query, ['range']), formValues.query);
      }
      return _.isEqual(_.omit(itemFormValues?.query, ['query', 'range']), _.omit(formValues.query, 'query'));
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
  if (localItems) {
    try {
      items = _.map(JSON.parse(localItems), (item) => {
        let formValues = item.formValues || {};
        // 如果是绝对时间则设置默认值 last 1 hour
        if (!isMathString(formValues.query?.range?.start) || !isMathString(formValues.query?.range?.end)) {
          _.set(formValues, 'query.range', {
            start: 'now-1h',
            end: 'now',
          });
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
    items = [
      {
        key: defaultActiveKey,
        isInited: false,
      },
    ];
  }
  const formValues = getFormValuesBySearch(params);
  if (formValues) {
    if (!formValuesIsInItems(formValues, items)) {
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
