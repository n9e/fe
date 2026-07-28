export type RowDetailData = Record<string, unknown>;

export const ROW_DETAIL_IGNORE_CLICK_AWAY_CLASS = 'n9e-dashboard-panel-table-ng-row-detail-ignore-click-away';

interface DisplayedRowsApi {
  forEachNodeAfterFilterAndSort: (callback: (node: { data?: object }) => void) => void;
}

export function getDisplayedRowDetails(api: DisplayedRowsApi, sourceRowByFormattedRow: WeakMap<object, RowDetailData>, formattedRow: object) {
  const currentRow = sourceRowByFormattedRow.get(formattedRow);
  if (!currentRow) {
    return {
      rows: [],
      currentIndex: -1,
    };
  }

  const rows: RowDetailData[] = [];
  api.forEachNodeAfterFilterAndSort((node) => {
    if (!node.data) return;
    const sourceRow = sourceRowByFormattedRow.get(node.data);
    if (sourceRow) {
      rows.push(sourceRow);
    }
  });

  return {
    rows,
    currentIndex: rows.indexOf(currentRow),
  };
}

export function shouldIgnoreRowDetailClickAway(target: HTMLElement | null): boolean {
  return !!(target && typeof target.closest === 'function' && target.closest(`.${ROW_DETAIL_IGNORE_CLICK_AWAY_CLASS}`));
}

export function serializeRowDetailValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function serializeRowDetail(row: RowDetailData): string {
  try {
    return JSON.stringify(row, null, 2);
  } catch {
    return String(row);
  }
}
