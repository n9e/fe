import _ from 'lodash';

import { IOptions, IOverride, CellOptions, IStandardOptions, IValueMapping, IThresholds } from '@/pages/dashboard/types';
import { getSerieTextObj } from '@/pages/dashboard/Renderer/utils/getCalculatedValuesBySeries';
import getOverridePropertiesByName from '@/pages/dashboard/Renderer/utils/getOverridePropertiesByName';
import type { TableData } from '@/pages/dashboard/transformations/types';
import { parseDisplayNumber } from './parseNumericValue';

import { TextObject } from '../CellRenderer/types';

export default function getFormattedRowData(
  tableData: TableData & {
    id: string;
    columns: string[];
    rows: {
      [key: string]: string | number | null;
    }[];
  },
  panelParams: {
    cellOptions: CellOptions;
    options: IOptions;
    overrides: IOverride[];
    rangeMode?: 'lcro' | 'lcrc';
  },
) {
  const { options, overrides, cellOptions } = panelParams;
  // 防御：activeIndex 越界 / 无帧数据时 tableData 可能为 undefined，返回空行避免渲染崩溃。
  if (!tableData || !Array.isArray(tableData.rows)) {
    return [];
  }
  return _.map(tableData.rows, (row) => {
    const newRow: { [key: string]: TextObject } = {};
    _.forEach(row, (value, field) => {
      const overrideProps = getOverridePropertiesByName(overrides, 'byName', field);
      const overrideCellOptions = overrideProps.cellOptions as CellOptions | undefined;
      const currentCellOptions = _.isEmpty(overrideProps) || !overrideCellOptions?.type ? cellOptions : overrideCellOptions;
      const currentOptions = _.isEmpty(overrideProps)
        ? options
        : {
            standardOptions: (overrideProps.standardOptions as IStandardOptions | undefined) || options.standardOptions,
            valueMappings: (overrideProps.valueMappings as IValueMapping[] | undefined) || options.valueMappings,
            thresholds: (overrideProps.thresholds as IThresholds | undefined) || options.thresholds,
          };

      let valueDomain: [number, number] = [0, 100];

      const standardOptions = currentOptions.standardOptions;
      if (standardOptions && typeof standardOptions.min === 'number' && typeof standardOptions.max === 'number') {
        valueDomain = [standardOptions.min, standardOptions.max];
      } else if (currentCellOptions.type === 'gauge') {
        const fieldObj = _.find(tableData.fields, (item) => item.state.displayName === field || item.name === field);
        if (fieldObj && fieldObj.type === 'number') {
          valueDomain = [fieldObj.state.calcs?.min ?? 0, fieldObj.state.calcs?.max ?? 100];
        }
      }

      let currentValue = value;
      let textObject = {} as Omit<TextObject, 'valueDomain'>;
      const parsedValue = parseDisplayNumber(currentValue);

      if (parsedValue !== null) {
        currentValue = parsedValue;
        textObject = getSerieTextObj(currentValue, currentOptions.standardOptions, currentOptions.valueMappings, currentOptions.thresholds, valueDomain) as Omit<
          TextObject,
          'valueDomain'
        >;
      } else {
        textObject = getSerieTextObj(value, currentOptions.standardOptions, currentOptions.valueMappings, currentOptions.thresholds, valueDomain, false) as Omit<
          TextObject,
          'valueDomain'
        >;
      }

      newRow[field] = {
        ...textObject,
        valueDomain,
      };
    });
    return newRow;
  });
}
