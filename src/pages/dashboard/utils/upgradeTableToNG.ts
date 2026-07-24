import _ from 'lodash';

const replaceLegacyLinkVariables = (url: string) => {
  return url
    .replace(/\$__field\.labels\.([A-Za-z0-9_]+)/g, '$__row.$1')
    .replace(/\$__field\.(name|value)/g, '$__row.$1');
};

const isRecord = (value: unknown): value is Record<string, any> => value != null && typeof value === 'object' && !Array.isArray(value);
const asRecordArray = (value: unknown): Record<string, any>[] => (Array.isArray(value) ? value.filter(isRecord) : []);
const asStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);

/** 将旧版 Table 面板转换为 TableNG 可识别的配置。 */
export function upgradeTableToNG(panel: any, availableFields?: string[]) {
  const fallback = _.cloneDeep(panel);
  try {
  if (!isRecord(fallback)) return fallback;

  const result = fallback;
  const custom = isRecord(result.custom) ? result.custom : {};
  const targets = asRecordArray(result.targets);
  const legacyLinks = asRecordArray(custom.links);
  const valueFieldNames = targets.filter((target) => typeof target.refId === 'string' && target.refId).map((target) => `__value_#${target.refId}`);
  const valueFieldDisplayNames = targets.map((target, index) => (typeof target.legend === 'string' && target.legend ? target.legend : valueFieldNames[index]));
  const renameByName = Object.fromEntries(valueFieldNames.map((fieldName: string) => [fieldName, valueFieldNames.length === 1 ? 'Value' : fieldName.replace('__value_#', 'Value_')]));
  const sortColumn = custom.sortColumn === 'value' ? (valueFieldNames.length === 1 ? 'Value' : custom.sortColumn) : custom.sortColumn;

  result.type = 'tableNG';
  result.custom = {
    ...custom,
    showHeader: custom.showHeader !== false,
    filterable: false,
    sortColumn,
    sortOrder: custom.sortOrder,
    cellOptions: {
      type: 'none',
    },
  };
  delete result.custom.links;
  delete result.custom.linkMode;

  result.options = {
    ...(isRecord(result.options) ? result.options : {}),
    links: [
      ...asRecordArray(isRecord(result.options) ? result.options.links : undefined),
      ...legacyLinks.map((link: any) => ({
        ...link,
        url: typeof link.url === 'string' ? replaceLegacyLinkVariables(link.url) : link.url,
      })),
    ],
  };
  result.targets = targets.map((target) => {
    const { legend, ...targetWithoutLegend } = target;
    return { ...targetWithoutLegend, instant: true };
  });
  result.overrides = asRecordArray(result.overrides).map((override) => {
    if (override.matcher?.id !== 'byFrameRefID') return override;
    const targetIndex = asRecordArray(result.targets).findIndex((target) => target.refId === override.matcher.value);
    const fieldName = targetIndex >= 0 ? valueFieldDisplayNames[targetIndex] : undefined;
    return {
      ...override,
      matcher: {
        id: 'byName',
        ...(fieldName ? { value: fieldName } : {}),
      },
      properties: {
        cellOptions: { type: 'none' },
        thresholds: {
          mode: 'absolute',
          steps: [{ color: 'rgb(44, 157, 61)', value: null, type: 'base' }],
        },
        ...(isRecord(override.properties) ? override.properties : {}),
      },
    };
  });
  const displayMode = typeof custom.displayMode === 'string' ? custom.displayMode : 'seriesToRows';
  if (displayMode === 'seriesToRows') {
    result.transformationsNG = [{ id: 'seriesToRows', options: { calc: typeof custom.calc === 'string' ? custom.calc : 'lastNotNull' } }];
  } else if (displayMode === 'labelsOfSeriesToRows') {
    const labelColumns = asStringArray(custom.columns).filter((field) => field !== 'value');
    const fields = asStringArray(availableFields).length ? asStringArray(availableFields) : [...labelColumns, ...valueFieldNames];
    result.transformationsNG = [
      {
        id: 'organize',
        options: {
          fields,
          excludeByName: Object.fromEntries(fields.map((field: string) => [field, !labelColumns.includes(field) && !valueFieldNames.includes(field)])),
          renameByName,
        },
      },
    ];
  } else {
    const dimensions = Array.isArray(custom.aggrDimension)
      ? asStringArray(custom.aggrDimension)
      : typeof custom.aggrDimension === 'string'
        ? [custom.aggrDimension]
        : [];
    const aggregation = custom.calc === 'lastNotNull' ? 'last' : typeof custom.calc === 'string' ? custom.calc : 'last';
    const groupedFields = {
      ...Object.fromEntries([...dimensions].sort().map((field: string) => [field, { operation: 'groupby', aggregations: [] }])),
      ...Object.fromEntries(valueFieldNames.map((fieldName: string) => [fieldName, { operation: 'aggregate', aggregations: [aggregation] }])),
    };
    const aggregatedValueFields = valueFieldNames.map((fieldName: string) => `${fieldName} (${aggregation})`);
    const organizeFields = [...dimensions, ...aggregatedValueFields];
    result.transformationsNG = [
      {
        id: 'merge',
        options: {},
      },
      {
        id: 'groupedAggregateTable',
        options: {
          fields: groupedFields,
        },
      },
      {
        id: 'organize',
        options: {
          fields: organizeFields,
          indexByName: Object.fromEntries(organizeFields.map((field: string, index: number) => [field, index])),
          renameByName: Object.fromEntries(
            aggregatedValueFields.map((fieldName: string, index: number) => [fieldName, valueFieldDisplayNames[index]]),
          ),
        },
      },
    ];
  }

  return result;
  } catch (error) {
    console.warn('Failed to upgrade legacy Table panel to TableNG', error);
    return fallback;
  }
}
