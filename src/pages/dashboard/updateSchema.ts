// @ts-nocheck
/**
 * Copyright 2014-2021 Grafana Labs
 */

import _ from 'lodash';

const MIXED_DATASOURCE_NAME = '-- Mixed --';
export const GRID_CELL_HEIGHT = 30;
export const GRID_CELL_VMARGIN = 8;
export const GRID_COLUMN_COUNT = 24;
export const DEFAULT_PANEL_SPAN = 4;
export const DEFAULT_ROW_HEIGHT = 250;
export const MIN_PANEL_HEIGHT = GRID_CELL_HEIGHT * 3;
const defaultDatasource = null;
enum VariableHide {
  dontHide,
  hideLabel,
  hideVariable,
}
enum MappingType {
  ValueToText = 'value', // was 1
  RangeToText = 'range', // was 2
  RegexToText = 'regex',
  SpecialValue = 'special',
}
enum SpecialValueMatch {
  True = 'true',
  False = 'false',
  Null = 'null',
  NaN = 'nan',
  NullAndNaN = 'null+nan',
  Empty = 'empty',
}
const colors = ['rgba(245, 54, 54, 0.9)', 'rgba(237, 129, 40, 0.89)', 'rgba(50, 172, 45, 0.97)'];

export default function updateSchema(old: any) {
  let i, j, k, n;
  const dashboard = old;
  const oldVersion = old.schemaVersion;
  const panelUpgrades: any[] = [];
  // this.dashboard.schemaVersion = 37;

  if (oldVersion >= 37) {
    return dashboard;
  }

  // version 2 schema changes
  if (oldVersion < 2) {
    // if (old.services) {
    //   if (old.services.filter) {
    //     this.dashboard.time = old.services.filter.time;
    //     this.dashboard.templating.list = old.services.filter.list || [];
    //   }
    // }

    panelUpgrades.push((panel: any) => {
      // rename panel type
      if (panel.type === 'graphite') {
        panel.type = 'graph';
      }

      if (panel.type !== 'graph') {
        return panel;
      }

      if (_.isBoolean(panel.legend)) {
        panel.legend = { show: panel.legend };
      }

      if (panel.grid) {
        if (panel.grid.min) {
          panel.grid.leftMin = panel.grid.min;
          delete panel.grid.min;
        }

        if (panel.grid.max) {
          panel.grid.leftMax = panel.grid.max;
          delete panel.grid.max;
        }
      }

      if (panel.y_format) {
        if (!panel.y_formats) {
          panel.y_formats = [];
        }
        panel.y_formats[0] = panel.y_format;
        delete panel.y_format;
      }

      if (panel.y2_format) {
        if (!panel.y_formats) {
          panel.y_formats = [];
        }
        panel.y_formats[1] = panel.y2_format;
        delete panel.y2_format;
      }

      return panel;
    });
  }

  // schema version 3 changes
  if (oldVersion < 3) {
    // ensure panel IDs
    panelUpgrades.push((panel: any) => {
      if (!panel.id) {
        panel.id = _.uniqueId('panel_');
      }
      return panel;
    });
  }

  // schema version 4 changes
  if (oldVersion < 4) {
    // move aliasYAxis changes
    panelUpgrades.push((panel: any) => {
      if (panel.type !== 'graph') {
        return panel;
      }

      _.forEach(panel.aliasYAxis, (value, key) => {
        panel.seriesOverrides = [{ alias: key, yaxis: value }];
      });

      delete panel.aliasYAxis;

      return panel;
    });
  }

  if (oldVersion < 6) {
    // update template variables
    for (i = 0; i < dashboard.templating.list.length; i++) {
      const variable = dashboard.templating.list[i];
      if (variable.datasource === void 0) {
        variable.datasource = null;
      }
      if (variable.type === 'filter') {
        variable.type = 'query';
      }
      if (variable.type === void 0) {
        variable.type = 'query';
      }
      if (variable.allFormat === void 0) {
        variable.allFormat = 'glob';
      }
    }
  }

  if (oldVersion < 7) {
    if (old.nav && old.nav.length) {
      dashboard.timepicker = old.nav[0];
    }

    // ensure query refIds
    panelUpgrades.push((panel: any) => {
      _.forEach(panel.targets, (target) => {
        if (!target.refId) {
          target.refId = panel.getNextQueryLetter && panel.getNextQueryLetter();
        }
      });

      return panel;
    });
  }

  if (oldVersion < 8) {
    panelUpgrades.push((panel: any) => {
      _.forEach(panel.targets, (target) => {
        // update old influxdb query schema
        if (target.fields && target.tags && target.groupBy) {
          if (target.rawQuery) {
            delete target.fields;
            delete target.fill;
          } else {
            target.select = _.map(target.fields, (field) => {
              const parts: any[] = [];
              parts.push({ type: 'field', params: [field.name] });
              parts.push({ type: field.func, params: [] });
              if (field.mathExpr) {
                parts.push({ type: 'math', params: [field.mathExpr] });
              }
              if (field.asExpr) {
                parts.push({ type: 'alias', params: [field.asExpr] });
              }
              return parts;
            });
            delete target.fields;
            _.forEach(target.groupBy, (part) => {
              if (part.type === 'time' && part.interval) {
                part.params = [part.interval];
                delete part.interval;
              }
              if (part.type === 'tag' && part.key) {
                part.params = [part.key];
                delete part.key;
              }
            });

            if (target.fill) {
              target.groupBy.push({ type: 'fill', params: [target.fill] });
              delete target.fill;
            }
          }
        }
      });

      return panel;
    });
  }

  // schema version 9 changes
  if (oldVersion < 9) {
    // move aliasYAxis changes
    panelUpgrades.push((panel: any) => {
      if (panel.type !== 'singlestat' && panel.thresholds !== '') {
        return panel;
      }

      if (panel.thresholds) {
        const k = panel.thresholds.split(',');

        if (k.length >= 3) {
          k.shift();
          panel.thresholds = k.join(',');
        }
      }

      return panel;
    });
  }

  // schema version 10 changes
  if (oldVersion < 10) {
    // move aliasYAxis changes
    panelUpgrades.push((panel: any) => {
      if (panel.type !== 'table') {
        return panel;
      }

      _.forEach(panel.styles, (style) => {
        if (style.thresholds && style.thresholds.length >= 3) {
          const k = style.thresholds;
          k.shift();
          style.thresholds = k;
        }
      });

      return panel;
    });
  }

  if (oldVersion < 12) {
    // update template variables
    // _.forEach(this.dashboard.getVariables(), (templateVariable: any) => {
    //   if (templateVariable.refresh) {
    //     templateVariable.refresh = 1;
    //   }
    //   if (!templateVariable.refresh) {
    //     templateVariable.refresh = 0;
    //   }
    //   if (templateVariable.hideVariable) {
    //     templateVariable.hide = 2;
    //   } else if (templateVariable.hideLabel) {
    //     templateVariable.hide = 1;
    //   }
    // });
  }

  if (oldVersion < 12) {
    // update graph yaxes changes
    panelUpgrades.push((panel: any) => {
      if (panel.type !== 'graph') {
        return panel;
      }
      if (!panel.grid) {
        return panel;
      }

      if (!panel.yaxes) {
        panel.yaxes = [
          {
            show: panel['y-axis'],
            min: panel.grid.leftMin,
            max: panel.grid.leftMax,
            logBase: panel.grid.leftLogBase,
            format: panel.y_formats[0],
            label: panel.leftYAxisLabel,
          },
          {
            show: panel['y-axis'],
            min: panel.grid.rightMin,
            max: panel.grid.rightMax,
            logBase: panel.grid.rightLogBase,
            format: panel.y_formats[1],
            label: panel.rightYAxisLabel,
          },
        ];

        panel.xaxis = {
          show: panel['x-axis'],
        };

        delete panel.grid.leftMin;
        delete panel.grid.leftMax;
        delete panel.grid.leftLogBase;
        delete panel.grid.rightMin;
        delete panel.grid.rightMax;
        delete panel.grid.rightLogBase;
        delete panel.y_formats;
        delete panel.leftYAxisLabel;
        delete panel.rightYAxisLabel;
        delete panel['y-axis'];
        delete panel['x-axis'];
      }

      return panel;
    });
  }

  if (oldVersion < 13) {
    // update graph yaxes changes
    panelUpgrades.push((panel: any) => {
      if (panel.type !== 'graph') {
        return panel;
      }
      if (!panel.grid) {
        return panel;
      }

      if (!panel.thresholds) {
        panel.thresholds = [];
      }
      const t1: any = {},
        t2: any = {};

      if (panel.grid.threshold1 !== null) {
        t1.value = panel.grid.threshold1;
        if (panel.grid.thresholdLine) {
          t1.line = true;
          t1.lineColor = panel.grid.threshold1Color;
          t1.colorMode = 'custom';
        } else {
          t1.fill = true;
          t1.fillColor = panel.grid.threshold1Color;
          t1.colorMode = 'custom';
        }
      }

      if (panel.grid.threshold2 !== null) {
        t2.value = panel.grid.threshold2;
        if (panel.grid.thresholdLine) {
          t2.line = true;
          t2.lineColor = panel.grid.threshold2Color;
          t2.colorMode = 'custom';
        } else {
          t2.fill = true;
          t2.fillColor = panel.grid.threshold2Color;
          t2.colorMode = 'custom';
        }
      }

      if (_.isNumber(t1.value)) {
        if (_.isNumber(t2.value)) {
          if (t1.value > t2.value) {
            t1.op = t2.op = 'lt';
            panel.thresholds.push(t1);
            panel.thresholds.push(t2);
          } else {
            t1.op = t2.op = 'gt';
            panel.thresholds.push(t1);
            panel.thresholds.push(t2);
          }
        } else {
          t1.op = 'gt';
          panel.thresholds.push(t1);
        }
      }

      delete panel.grid.threshold1;
      delete panel.grid.threshold1Color;
      delete panel.grid.threshold2;
      delete panel.grid.threshold2Color;
      delete panel.grid.thresholdLine;

      return panel;
    });
  }

  if (oldVersion < 14) {
    dashboard.graphTooltip = old.sharedCrosshair ? 1 : 0;
  }

  if (oldVersion < 16) {
    upgradeToGridLayout(old, dashboard);
  }

  if (oldVersion < 17) {
    panelUpgrades.push((panel: any) => {
      if (panel.minSpan) {
        const max = GRID_COLUMN_COUNT / panel.minSpan;
        const factors = getFactors(GRID_COLUMN_COUNT);
        // find the best match compared to factors
        // (ie. [1,2,3,4,6,12,24] for 24 columns)
        panel.maxPerRow =
          factors[
            _.findIndex(factors, (o) => {
              return o > max;
            }) - 1
          ];
      }

      delete panel.minSpan;

      return panel;
    });
  }

  if (oldVersion < 18) {
    // migrate change to gauge options
    panelUpgrades.push((panel: any) => {
      if (panel['options-gauge']) {
        panel.options = panel['options-gauge'];
        panel.options.valueOptions = {
          unit: panel.options.unit,
          stat: panel.options.stat,
          decimals: panel.options.decimals,
          prefix: panel.options.prefix,
          suffix: panel.options.suffix,
        };

        // correct order
        if (panel.options.thresholds) {
          panel.options.thresholds.reverse();
        }

        // this options prop was due to a bug
        delete panel.options.options;
        delete panel.options.unit;
        delete panel.options.stat;
        delete panel.options.decimals;
        delete panel.options.prefix;
        delete panel.options.suffix;
        delete panel['options-gauge'];
      }

      return panel;
    });
  }

  if (oldVersion < 19) {
  }

  if (oldVersion < 20) {
  }

  if (oldVersion < 21) {
    const updateLinks = (link: any) => {
      return {
        ...link,
        url: link.url.replace(/__series.labels/g, '__field.labels'),
      };
    };
    panelUpgrades.push((panel: any) => {
      // For graph panel
      if (panel.options && panel.options.dataLinks && _.isArray(panel.options.dataLinks)) {
        panel.options.dataLinks = panel.options.dataLinks.map(updateLinks);
      }

      // For panel with fieldOptions
      if (panel.options && panel.options.fieldOptions && panel.options.fieldOptions.defaults) {
        if (panel.options.fieldOptions.defaults.links && _.isArray(panel.options.fieldOptions.defaults.links)) {
          panel.options.fieldOptions.defaults.links = panel.options.fieldOptions.defaults.links.map(updateLinks);
        }
      }

      return panel;
    });
  }

  if (oldVersion < 22) {
    panelUpgrades.push((panel: any) => {
      if (panel.type !== 'table') {
        return panel;
      }

      _.forEach(panel.styles, (style) => {
        style.align = 'auto';
      });

      return panel;
    });
  }

  if (oldVersion < 23) {
    for (const variable of dashboard.templating.list) {
      if (!isMulti(variable)) {
        continue;
      }
      const { multi, current } = variable;
      variable.current = alignCurrentWithMulti(current, multi);
    }
  }

  if (oldVersion < 24) {
    // 7.0
    // - migrate existing tables to 'table-old'
    panelUpgrades.push((panel: any) => {
      const wasAngularTable = panel.type === 'table';
      if (wasAngularTable && !panel.styles) {
        return panel; // styles are missing so assumes default settings
      }
      const wasReactTable = panel.table === 'table2';
      if (!wasAngularTable || wasReactTable) {
        return panel;
      }
      panel.type = wasAngularTable ? 'table-old' : 'table';
      return panel;
    });
  }

  if (oldVersion < 25) {
  }

  if (oldVersion < 26) {
    panelUpgrades.push((panel: any) => {
      const wasReactText = panel.type === 'text2';
      if (!wasReactText) {
        return panel;
      }

      panel.type = 'text';
      delete panel.options.angular;
      return panel;
    });
  }

  if (oldVersion < 27) {
    dashboard.templating.list = dashboard.templating.list.map((variable) => {
      if (!isConstant(variable)) {
        return variable;
      }

      const newVariable: any = {
        ...variable,
      };

      newVariable.current = { selected: true, text: newVariable.query ?? '', value: newVariable.query ?? '' };
      newVariable.options = [newVariable.current];

      if (newVariable.hide === VariableHide.dontHide || newVariable.hide === VariableHide.hideLabel) {
        return {
          ...newVariable,
          type: 'textbox',
        };
      }

      return newVariable;
    });
  }

  if (oldVersion < 28) {
    panelUpgrades.push((panel: any) => {
      if (panel.type === 'singlestat') {
        return migrateSinglestat(panel);
      }

      return panel;
    });

    for (const variable of dashboard.templating.list) {
      if (variable.tags) {
        delete variable.tags;
      }

      if (variable.tagsQuery) {
        delete variable.tagsQuery;
      }

      if (variable.tagValuesQuery) {
        delete variable.tagValuesQuery;
      }

      if (variable.useTags) {
        delete variable.useTags;
      }
    }
  }

  if (oldVersion < 29) {
    for (const variable of dashboard.templating.list) {
      if (variable.type !== 'query') {
        continue;
      }

      if (variable.refresh !== 1 && variable.refresh !== 2) {
        variable.refresh = 1;
      }

      if (variable.options?.length) {
        variable.options = [];
      }
    }
  }

  if (oldVersion < 30) {
    panelUpgrades.push(upgradeValueMappingsForPanel);
    panelUpgrades.push(migrateTooltipOptions);
  }

  if (oldVersion < 31) {
  }

  if (oldVersion < 32) {
  }

  if (oldVersion < 33) {
  }

  if (oldVersion < 34) {
    panelUpgrades.push((panel: any) => {
      // this.migrateCloudWatchQueries(panel);
      return panel;
    });

    // this.migrateCloudWatchAnnotationQuery();
  }

  if (oldVersion < 35) {
  }

  if (oldVersion < 36) {
  }

  if (oldVersion < 37) {
    panelUpgrades.push((panel: any) => {
      if (
        panel.options?.legend &&
        // There were two ways to hide the legend, this normalizes to `legend.showLegend`
        (panel.options.legend.displayMode === 'hidden' || panel.options.legend.showLegend === false)
      ) {
        panel.options.legend.displayMode = 'list';
        panel.options.legend.showLegend = false;
      } else if (panel.options?.legend) {
        panel.options.legend = { ...panel.options?.legend, showLegend: true };
      }
      return panel;
    });
  }

  if (panelUpgrades.length === 0) {
    return;
  }

  for (j = 0; j < dashboard.panels.length; j++) {
    for (k = 0; k < panelUpgrades.length; k++) {
      dashboard.panels[j] = panelUpgrades[k](dashboard.panels[j]);
      const rowPanels = dashboard.panels[j].panels;
      if (rowPanels) {
        for (n = 0; n < rowPanels.length; n++) {
          rowPanels[n] = panelUpgrades[k](rowPanels[n]);
        }
      }
    }
  }
  return dashboard;
}

function upgradeToGridLayout(old: any, dashboard: any) {
  dashboard.panels = dashboard.panels || [];
  let yPos = 0;
  const widthFactor = GRID_COLUMN_COUNT / 12;

  const maxPanelId = _.max(
    _.flattenDeep(
      _.map(old.rows, (row) => {
        return _.map(row.panels, 'id');
      }),
    ),
  );
  let nextRowId = maxPanelId + 1;

  if (!old.rows) {
    return;
  }

  // Add special "row" panels if even one row is collapsed, repeated or has visible title
  const showRows = _.some(old.rows, (row) => row.collapse || row.showTitle || row.repeat);

  for (const row of old.rows) {
    if (row.repeatIteration) {
      continue;
    }

    const height: any = row.height || DEFAULT_ROW_HEIGHT;
    const rowGridHeight = getGridHeight(height);

    const rowPanel: any = {};
    let rowPanelModel: any;

    if (showRows) {
      // add special row panel
      rowPanel.id = nextRowId;
      rowPanel.type = 'row';
      rowPanel.title = row.title;
      rowPanel.collapsed = row.collapse;
      rowPanel.repeat = row.repeat;
      rowPanel.panels = [];
      rowPanel.gridPos = {
        x: 0,
        y: yPos,
        w: GRID_COLUMN_COUNT,
        h: 1,
      };
      rowPanelModel = rowPanel;
      // rowPanelModel = new PanelModel(rowPanel);
      nextRowId++;
      yPos++;
    }

    const rowArea = new RowArea(rowGridHeight, GRID_COLUMN_COUNT, yPos);

    for (const panel of row.panels) {
      panel.span = panel.span || DEFAULT_PANEL_SPAN;
      if (panel.minSpan) {
        panel.minSpan = Math.min(GRID_COLUMN_COUNT, (GRID_COLUMN_COUNT / 12) * panel.minSpan);
      }
      const panelWidth = Math.floor(panel.span) * widthFactor;
      const panelHeight = panel.height ? getGridHeight(panel.height) : rowGridHeight;

      const panelPos = rowArea.getPanelPosition(panelHeight, panelWidth);
      yPos = rowArea.yPos;
      panel.gridPos = {
        x: panelPos.x,
        y: yPos + panelPos.y,
        w: panelWidth,
        h: panelHeight,
      };
      rowArea.addPanel(panel.gridPos);

      delete panel.span;

      if (rowPanelModel && rowPanel.collapsed) {
        rowPanelModel.panels?.push(panel);
      } else {
        dashboard.panels.push(panel);
      }
    }

    if (rowPanelModel) {
      dashboard.panels.push(rowPanelModel);
    }

    if (!(rowPanelModel && rowPanel.collapsed)) {
      yPos += rowGridHeight;
    }
  }
}

function getGridHeight(height: number) {
  if (_.isString(height)) {
    height = parseInt(_.replace(height, 'px', ''), 10);
  }

  if (height < MIN_PANEL_HEIGHT) {
    height = MIN_PANEL_HEIGHT;
  }

  const gridHeight = Math.ceil(height / (GRID_CELL_HEIGHT + GRID_CELL_VMARGIN));
  return gridHeight;
}

function getFactors(num: number): number[] {
  return Array.from(new Array(num + 1), (_, i) => i).filter((i) => num % i === 0);
}

function upgradeValueMappingsForPanel(panel: any) {
  const fieldConfig = panel.fieldConfig;
  if (!fieldConfig) {
    return panel;
  }

  if (fieldConfig.defaults && fieldConfig.defaults.mappings) {
    fieldConfig.defaults.mappings = upgradeValueMappings(fieldConfig.defaults.mappings, fieldConfig.defaults.thresholds);
  }

  // Protect against no overrides
  if (Array.isArray(fieldConfig.overrides)) {
    for (const override of fieldConfig.overrides) {
      for (const prop of override.properties) {
        if (prop.id === 'mappings') {
          prop.value = upgradeValueMappings(prop.value);
        }
      }
    }
  }

  return panel;
}

function upgradeValueMappings(oldMappings: any, thresholds?: any): any[] | undefined {
  if (!oldMappings) {
    return undefined;
  }

  const valueMaps: any = { type: MappingType.ValueToText, options: {} };
  const newMappings: any[] = [];

  for (const old of oldMappings) {
    // when migrating singlestat to stat/gauge, mappings are handled by panel type change handler used in that migration
    if (old.type && old.options) {
      // collect al value->text mappings in a single value map object. These are migrated by panel change handler as a separate value maps
      if (old.type === MappingType.ValueToText) {
        valueMaps.options = {
          ...valueMaps.options,
          ...old.options,
        };
      } else {
        newMappings.push(old);
      }
      continue;
    }

    // Use the color we would have picked from thesholds
    let color: string | undefined = undefined;
    const numeric = parseFloat(old.text);
    if (thresholds && !isNaN(numeric)) {
      const level = getActiveThreshold(numeric, thresholds.steps);
      if (level && level.color) {
        color = level.color;
      }
    }

    switch (old.type) {
      case 1: // MappingType.ValueToText:
        if (old.value != null) {
          if (old.value === 'null') {
            newMappings.push({
              type: MappingType.SpecialValue,
              options: {
                match: SpecialValueMatch.Null,
                result: { text: old.text, color },
              },
            });
          } else {
            valueMaps.options[String(old.value)] = {
              text: old.text,
              color,
            };
          }
        }
        break;
      case 2: // MappingType.RangeToText:
        newMappings.push({
          type: MappingType.RangeToText,
          options: {
            from: +old.from,
            to: +old.to,
            result: { text: old.text, color },
          },
        });
        break;
    }
  }

  if (Object.keys(valueMaps.options).length > 0) {
    newMappings.unshift(valueMaps);
  }

  return newMappings;
}

function migrateTooltipOptions(panel: any) {
  if (panel.type === 'timeseries' || panel.type === 'xychart') {
    if (panel.options.tooltipOptions) {
      panel.options = {
        ...panel.options,
        tooltip: panel.options.tooltipOptions,
      };
      delete panel.options.tooltipOptions;
    }
  }

  return panel;
}

class RowArea {
  area: number[];
  yPos: number;
  height: number;

  constructor(height: number, width = GRID_COLUMN_COUNT, rowYPos = 0) {
    this.area = new Array(width).fill(0);
    this.yPos = rowYPos;
    this.height = height;
  }

  reset() {
    this.area.fill(0);
  }

  /**
   * Update area after adding the panel.
   */
  addPanel(gridPos: any) {
    for (let i = gridPos.x; i < gridPos.x + gridPos.w; i++) {
      if (!this.area[i] || gridPos.y + gridPos.h - this.yPos > this.area[i]) {
        this.area[i] = gridPos.y + gridPos.h - this.yPos;
      }
    }
    return this.area;
  }

  /**
   * Calculate position for the new panel in the row.
   */
  getPanelPosition(panelHeight: number, panelWidth: number, callOnce = false): any {
    let startPlace, endPlace;
    let place;
    for (let i = this.area.length - 1; i >= 0; i--) {
      if (this.height - this.area[i] > 0) {
        if (endPlace === undefined) {
          endPlace = i;
        } else {
          if (i < this.area.length - 1 && this.area[i] <= this.area[i + 1]) {
            startPlace = i;
          } else {
            break;
          }
        }
      } else {
        break;
      }
    }

    if (startPlace !== undefined && endPlace !== undefined && endPlace - startPlace >= panelWidth - 1) {
      const yPos = _.max(this.area.slice(startPlace));
      place = {
        x: startPlace,
        y: yPos,
      };
    } else if (!callOnce) {
      // wrap to next row
      this.yPos += this.height;
      this.reset();
      return this.getPanelPosition(panelHeight, panelWidth, true);
    } else {
      return null;
    }

    return place;
  }
}

const isMulti = (model: any): model is any => {
  return 'multi' in model;
};

const alignCurrentWithMulti = (current: any, value: boolean): any => {
  if (!current) {
    return current;
  }

  if (value && !Array.isArray(current.value)) {
    return {
      ...current,
      value: convertToMulti(current.value),
      text: convertToMulti(current.text),
    };
  }

  if (!value && Array.isArray(current.value)) {
    return {
      ...current,
      value: convertToSingle(current.value),
      text: convertToSingle(current.text),
    };
  }

  return current;
};

const convertToSingle = (value: string | string[]): string => {
  if (!Array.isArray(value)) {
    return value;
  }

  if (value.length > 0) {
    return value[0];
  }

  return '';
};

const convertToMulti = (value: string | string[]): string[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
};

const isConstant = (model: any): model is any => {
  return model.type === 'constant';
};

function getActiveThreshold(value: number, thresholds: any[] | undefined): any {
  if (!thresholds || thresholds.length === 0) {
    return { value: 0, color: 'gray' };
  }

  let active = thresholds[0];

  for (const threshold of thresholds) {
    if (value >= threshold.value) {
      active = threshold;
    } else {
      break;
    }
  }

  return active;
}

function migrateSinglestat(panel: any) {
  panel.options = {
    colorMode: 'value',
    graphMode: 'none',
    justifyMode: 'auto',
    orientation: 'horizontal',
    reduceOptions: {
      calcs: ['lastNotNull'],
      fields: '',
      values: false,
    },
    textMode: 'auto',
  };
  const thresholds = _.split(panel.thresholds, ',');
  if (_.compact(thresholds)?.length > 0) {
    panel.fieldConfig = {
      defaults: {
        color: {
          mode: 'thresholds',
        },
        thresholds: {
          mode: 'absolute',
          steps: _.concat(
            [
              {
                color: panel.colors?.[0] || colors[0],
                value: null as any,
              },
            ],
            _.map(thresholds, (threshold, idx) => {
              const colorIndex = idx + 1;
              return {
                color: panel.colors?.[colorIndex] || colors[colorIndex % colors.length],
                value: _.toNumber(threshold),
              };
            }),
          ),
        },
        unit: panel.format,
      },
    };
  }
  if ((panel as any).gauge?.show) {
    panel.type = 'gauge';
  } else {
    panel.type = 'stat';
  }
  return panel;
}
