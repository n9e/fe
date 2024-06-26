import _ from 'lodash';

export const setLocalQueryHistory = (datasourceValue: number | undefined, query: string) => {
  if (!datasourceValue || !query) return;
  const localKey = `es-query-history-${datasourceValue}`;
  query = _.trim(query);
  const queryHistoryStr = localStorage.getItem(localKey);
  let queryHistoryMap = new Map();
  if (queryHistoryStr) {
    try {
      const queryHistory = JSON.parse(queryHistoryStr);
      queryHistoryMap = new Map(queryHistory);
    } catch (e) {
      console.error(e);
    }
  }
  if (queryHistoryMap.has(query)) {
    const count = queryHistoryMap.get(query);
    let newCount = 1;
    if (_.isNumber(count)) {
      newCount = count + 1;
    }
    queryHistoryMap.set(query, newCount);
  } else {
    if (queryHistoryMap.size < 20) {
      queryHistoryMap.set(query, 1);
    } else {
      const minCount = _.min(Array.from(queryHistoryMap.values()));
      if (minCount) {
        for (const x of queryHistoryMap.entries()) {
          if (x[1] === minCount) {
            queryHistoryMap.delete(x[0]);
            break;
          }
        }
        queryHistoryMap.set(query, 1);
      }
    }
  }
  const newQueryHistory: [string, number][] = [];
  for (const x of queryHistoryMap.entries()) {
    newQueryHistory.push(x);
  }
  localStorage.setItem(localKey, JSON.stringify(newQueryHistory));
};

export const getLocalQueryHistory = (datasourceValue?: number) => {
  if (!datasourceValue) return [];
  const localKey = `es-query-history-${datasourceValue}`;
  const queryHistoryStr = localStorage.getItem(localKey);
  let queryHistoryMap = new Map();
  if (queryHistoryStr) {
    try {
      const queryHistory = JSON.parse(queryHistoryStr);
      queryHistoryMap = new Map(queryHistory);
    } catch (e) {
      console.error(e);
    }
  }
  const queryHistory: [string, number][] = [];
  for (const x of queryHistoryMap.entries()) {
    queryHistory.push(x);
  }
  return _.slice(_.reverse(_.sortBy(queryHistory, (item) => item[1])), 0, 10);
};
