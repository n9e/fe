import { createGlobalState } from 'react-hooks-global-state';

export const N9E_ES_FIELD_VALUES_TOPN_CACHE_KEY = 'N9E_ES_FIELD_VALUES_TOPN_CACHE_KEY';

export const { useGlobalState } = createGlobalState<{
  topn: number;
}>({
  topn: Number(window.localStorage.getItem(N9E_ES_FIELD_VALUES_TOPN_CACHE_KEY)) || 5,
});
