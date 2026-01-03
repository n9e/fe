import _ from 'lodash';

import getFormValuesBySearchParams from './getFormValuesBySearchParams';
import formValuesIsInItems from './formValuesIsInItems';
import { DEFAULT_ACTIVE_KEY, LOCALE_ACTIVE_KEY } from '../constants';

export function getLocalActiveKey(params: { [index: string]: string | null }, items: any[]) {
  let activeKey = localStorage.getItem(LOCALE_ACTIVE_KEY);
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
  return DEFAULT_ACTIVE_KEY;
}

export function setLocalActiveKey(activeKey: string) {
  localStorage.setItem(LOCALE_ACTIVE_KEY, activeKey);
}
