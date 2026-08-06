import _ from 'lodash';
import type { IPanel, ITarget, IOverride, LinksItem } from '../types';

const toRowVariable = (fieldName: string) => `\${__row.${fieldName}}`;

const replaceLegacyLinkVariables = (url: string, valueFieldName: string) => {
  return url
    .replace(/\$\{__field\.labels\.([^}]+)\}/g, (_match, fieldName) => toRowVariable(fieldName))
    .replace(/\$\{__field\.name\}/g, '${__row.__name__}')
    .replace(/\$\{__field\.value\}/g, () => toRowVariable(valueFieldName))
    .replace(/\[\[__field\.labels\.([^\]]+)\]\]/g, (_match, fieldName) => toRowVariable(fieldName))
    .replace(/\[\[__field\.name\]\]/g, '${__row.__name__}')
    .replace(/\[\[__field\.value\]\]/g, () => toRowVariable(valueFieldName))
    .replace(/\$__field\.labels\.([A-Za-z0-9_.-]+)/g, (_match, fieldName) => toRowVariable(fieldName))
    .replace(/\$__field\.name/g, '${__row.__name__}')
    .replace(/\$__field\.value/g, () => toRowVariable(valueFieldName));
};

const isRecord = (value: unknown): value is Record<string, unknown> => value != null && typeof value === 'object' && !Array.isArray(value);
const asRecordArray = (value: unknown): Record<string, unknown>[] => (Array.isArray(value) ? value.filter(isRecord) : []);
const asStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);

const resolveTransformedFieldName = (sourceFieldName: string, transformations: unknown) => {
  let fieldName = sourceFieldName;
  asRecordArray(transformations).forEach((transformation) => {
    const options = isRecord(transformation.options) ? transformation.options : {};
    if (transformation.id === 'groupedAggregateTable' && isRecord(options.fields)) {
      const fieldOptions = options.fields[fieldName];
      if (isRecord(fieldOptions) && fieldOptions.operation === 'aggregate') {
        const aggregation = asStringArray(fieldOptions.aggregations)[0];
        if (aggregation) fieldName = `${fieldName} (${aggregation})`;
      }
    }
    if (transformation.id === 'organize' && isRecord(options.renameByName)) {
      const renamedField = options.renameByName[fieldName];
      if (typeof renamedField === 'string' && renamedField) fieldName = renamedField;
    }
  });
  return fieldName;
};

/** 将旧版 Table 面板转换为 TableNG 可识别的配置。 */
export function upgradeTableToNG(panel: IPanel, availableFields?: string[]): IPanel {
  const fallback = _.cloneDeep(panel);
  try {
    if (!isRecord(fallback)) return fallback;

    const result = fallback;
    const custom = isRecord(result.custom) ? result.custom : {};
    const displayMode = typeof custom.displayMode === 'string' ? custom.displayMode : 'seriesToRows';
    const targets = asRecordArray(result.targets);
    const legacyLinks = asRecordArray(custom.links);
    const existingOptionLinks = asRecordArray(isRecord(result.options) ? result.options.links : undefined);
    const valueFieldNames = targets.filter((target) => typeof target.refId === 'string' && target.refId).map((target) => `__value_#${target.refId}`);
    const valueFieldDisplayNames = targets.map((target, index) => (typeof target.legend === 'string' && target.legend ? target.legend : valueFieldNames[index]));
    const renameByName = Object.fromEntries(
      valueFieldNames.map((fieldName: string) => [fieldName, valueFieldNames.length === 1 ? 'value' : fieldName.replace('__value_#', 'value_')]),
    );
    const sortColumn = custom.sortColumn;

    result.type = 'tableNG';
    result.custom = {
      showHeader: custom.showHeader !== false,
      filterable: false,
      sortColumn,
      sortOrder: custom.sortOrder,
      cellOptions: {
        type: 'none',
      },
    };
    result.options = { ...(isRecord(result.options) ? result.options : {}) };
    delete result.options.links;
    result.targets = targets.map((target) => {
      if (displayMode === 'labelValuesToRows') {
        const { legend, ...targetWithoutLegend } = target;
        return { ...targetWithoutLegend, instant: true };
      }
      return { ...target, instant: true };
    }) as ITarget[];
    result.overrides = asRecordArray(result.overrides).map((override) => {
      const matcher = isRecord(override.matcher) ? override.matcher : undefined;
      if (matcher?.id !== 'byFrameRefID') return override;
      const targetIndex = asRecordArray(result.targets).findIndex((target) => target.refId === matcher.value);
      let fieldName: string | undefined;
      if (targetIndex >= 0) {
        if (displayMode === 'labelValuesToRows') {
          fieldName = valueFieldDisplayNames[targetIndex];
        } else if (valueFieldNames.length === 1) {
          fieldName = 'value';
        } else {
          fieldName = `value_${result.targets[targetIndex].refId}`;
        }
      }
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
    }) as unknown as IOverride[];
    if (displayMode === 'seriesToRows') {
      const fields = asStringArray(availableFields).length ? asStringArray(availableFields) : ['__name__', ...valueFieldNames];
      const nameField = fields.find((field) => field === '__name__') || fields.find((field) => field === 'name');
      const visibleFields = [...(nameField ? [nameField] : []), ...valueFieldNames];
      result.transformationsNG = [
        {
          id: 'organize',
          options: {
            fields,
            excludeByName: Object.fromEntries(fields.filter((field) => !visibleFields.includes(field)).map((field) => [field, true])),
            renameByName: {
              ...(nameField ? { [nameField]: 'name' } : {}),
              ...renameByName,
            },
          },
        },
      ];
    } else if (displayMode === 'labelsOfSeriesToRows') {
      const labelColumns = asStringArray(custom.columns).filter((field) => field !== 'value');
      const fields = asStringArray(availableFields).length ? asStringArray(availableFields) : [...labelColumns, ...valueFieldNames];
      result.transformationsNG = [
        {
          id: 'organize',
          options: {
            fields,
            excludeByName: Object.fromEntries(
              fields.filter((field: string) => !labelColumns.includes(field) && !valueFieldNames.includes(field)).map((field: string) => [field, true]),
            ),
            renameByName,
          },
        },
      ];
    } else {
      const dimensions = Array.isArray(custom.aggrDimension) ? asStringArray(custom.aggrDimension) : typeof custom.aggrDimension === 'string' ? [custom.aggrDimension] : [];
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
            renameByName: Object.fromEntries(aggregatedValueFields.map((fieldName: string, index: number) => [fieldName, valueFieldDisplayNames[index]])),
          },
        },
      ];
    }

    const valueFieldName = resolveTransformedFieldName(valueFieldNames[0] || 'value', result.transformationsNG);
    const optionLinks = [...existingOptionLinks, ...legacyLinks].map((link) => ({
      ...link,
      url: typeof link.url === 'string' ? replaceLegacyLinkVariables(link.url, valueFieldName) : link.url,
    })) as LinksItem[];
    if (optionLinks.length) result.options.links = optionLinks;

    return result;
  } catch (error) {
    console.warn('Failed to upgrade legacy Table panel to TableNG', error);
    return fallback;
  }
}
