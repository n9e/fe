import _ from 'lodash';
import moment from 'moment';

import { isMathString, parseRange } from '@/components/TimeRangePicker';

import getFormValuesBySearchParams from './getFormValuesBySearchParams';
import formValuesIsInItems from './formValuesIsInItems';
import getUUID from './getUUID';
import { DEFAULT_ACTIVE_KEY, LOCALE_KEY } from '../constants';

export function getLocalItems(params) {
  const localItems = localStorage.getItem(LOCALE_KEY);
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
        key: DEFAULT_ACTIVE_KEY,
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
          key: getUUID(),
          isInited: false,
          formValues,
        },
      ];
    }
  }
  return items;
}

export function setLocalItems(items: any) {
  try {
    localStorage.setItem(
      LOCALE_KEY,
      JSON.stringify(
        _.map(items, (item) => {
          return _.omit(item, ['isInited']);
        }),
      ),
    );
  } catch (e) {
    console.warn(e);
  }
}
