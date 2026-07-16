import type { Key } from 'react';

import _ from 'lodash';

import type { LogExplorerTabItem } from '../types';

function normalizeReactKey(key: string) {
  return key
    .replace(/^\.\$?/, '')
    .replace(/^\$/, '')
    .replace(/=0/g, '=')
    .replace(/=2/g, ':');
}

export function resolveTabKey(nodeKey: Key | null | undefined, tabKeys: string[]): string | undefined {
  if (nodeKey === null || nodeKey === undefined) {
    return undefined;
  }

  const key = String(nodeKey);
  const candidates = _.uniq([key, normalizeReactKey(key)]);
  return _.find(candidates, (candidate) => _.includes(tabKeys, candidate));
}

export function moveLogExplorerTabItems(items: LogExplorerTabItem[], activeId: string, overId: string) {
  if (activeId === overId) {
    return items;
  }

  const oldIndex = _.findIndex(items, { key: activeId });
  const newIndex = _.findIndex(items, { key: overId });
  if (oldIndex === -1 || newIndex === -1) {
    return items;
  }

  const newItems = [...items];
  const [movedItem] = newItems.splice(oldIndex, 1);
  newItems.splice(newIndex, 0, movedItem);
  return newItems;
}
