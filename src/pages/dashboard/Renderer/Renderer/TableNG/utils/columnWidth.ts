import _ from 'lodash';

import { IOverride } from '@/pages/dashboard/types';

export const TABLE_COLUMN_MIN_WIDTH = 100;

type ColumnWidths = Record<string, number>;
type ColumnWidthStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function isValidColumnWidth(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= TABLE_COLUMN_MIN_WIDTH;
}

export function getColumnWidthColDef(width: unknown): { width: number; flex: 0 } | Record<string, never> {
  if (!isValidColumnWidth(width)) return {};
  return {
    width,
    flex: 0,
  };
}

export function readCachedColumnWidths(cacheKey: string | null, storage: ColumnWidthStorage = localStorage): ColumnWidths {
  if (!cacheKey) return {};

  try {
    const value = JSON.parse(storage.getItem(cacheKey) || '{}');
    if (!_.isPlainObject(value)) return {};

    return _.pickBy(value as ColumnWidths, isValidColumnWidth);
  } catch {
    return {};
  }
}

export function getOverrideColumnWidths(overrides: IOverride[] = []): ColumnWidths {
  return _.reduce(
    overrides,
    (result, override) => {
      const matcherType = override?.matcher?.id || override?.matcher?.type;
      const field = override?.matcher?.value;
      const width = override?.properties?.width;

      if (matcherType === 'byName' && field && isValidColumnWidth(width)) {
        result[field] = width;
      }
      return result;
    },
    {} as ColumnWidths,
  );
}

export function getResolvedColumnWidths(cachedWidths: ColumnWidths, overrides: IOverride[] = []): ColumnWidths {
  return {
    ...cachedWidths,
    ...getOverrideColumnWidths(overrides),
  };
}

export function upsertColumnWidthOverride(overrides: IOverride[] = [], field: string, width: number): IOverride[] {
  if (!field || !isValidColumnWidth(width)) return overrides;

  const lastMatchedIndex = _.findLastIndex(overrides, (override) => {
    const matcherType = override?.matcher?.id || override?.matcher?.type;
    return matcherType === 'byName' && override?.matcher?.value === field;
  });

  if (lastMatchedIndex === -1) {
    return [
      ...overrides,
      {
        matcher: {
          id: 'byName',
          value: field,
        },
        properties: {
          width,
        },
      },
    ];
  }

  return _.map(overrides, (override, index) => {
    if (index !== lastMatchedIndex) return override;
    return {
      ...override,
      properties: {
        ...override.properties,
        width,
      },
    };
  });
}

export function removeCachedColumnWidth(cacheKey: string | null, field: string, storage: ColumnWidthStorage = localStorage): ColumnWidths {
  if (!cacheKey || !field) return {};

  const cachedWidths = readCachedColumnWidths(cacheKey, storage);
  const remainingWidths = _.omit(cachedWidths, field);

  try {
    if (_.isEmpty(remainingWidths)) {
      storage.removeItem(cacheKey);
    } else {
      storage.setItem(cacheKey, JSON.stringify(remainingWidths));
    }
  } catch {
    // ignore storage errors
  }

  return remainingWidths;
}
