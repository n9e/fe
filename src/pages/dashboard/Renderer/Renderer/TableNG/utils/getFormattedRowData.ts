import _ from 'lodash';

import { IOptions, IOverride, CellOptions } from '@/pages/dashboard/types';
import { getSerieTextObj } from '@/pages/dashboard/Renderer/utils/getCalculatedValuesBySeries';
import getOverridePropertiesByName from '@/pages/dashboard/Renderer/utils/getOverridePropertiesByName';
import type { TableData } from '@/pages/dashboard/transformations/types';

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
  },
) {
  const { options, overrides, cellOptions } = panelParams;
  return _.map(tableData.rows, (row) => {
    const newRow: { [key: string]: TextObject } = {};
    _.forEach(row, (value, field) => {
      const overrideProps = getOverridePropertiesByName(overrides, 'byName', field);
      const currentCellOptions = _.isEmpty(overrideProps) || !overrideProps.cellOptions?.type ? cellOptions : overrideProps.cellOptions;
      const currentOptions = _.isEmpty(overrideProps)
        ? options
        : {
            standardOptions: overrideProps.standardOptions || options.standardOptions,
            valueMappings: overrideProps.valueMappings || options.valueMappings,
            thresholds: overrideProps.thresholds || options.thresholds,
          };

      let valueDomain: [number, number] = [0, 100];

      if (_.isNumber(currentOptions.standardOptions.min) && _.isNumber(currentOptions.standardOptions.max)) {
        valueDomain = [currentOptions.standardOptions.min, currentOptions.standardOptions.max];
      } else if (currentCellOptions.type === 'gauge') {
        const fieldObj = _.find(tableData.fields, (item) => item.state.displayName === field || item.name === field);
        if (fieldObj && fieldObj.type === 'number') {
          valueDomain = [fieldObj.state.calcs?.min ?? 0, fieldObj.state.calcs?.max ?? 100];
        }
      }

      let currentValue = value;
      let textObject = {} as Omit<TextObject, 'valueDomain'>;

      if (currentValue !== null && !_.isNaN(_.toNumber(currentValue))) {
        currentValue = _.toNumber(currentValue);
        textObject = getSerieTextObj(currentValue, currentOptions.standardOptions, currentOptions.valueMappings, currentOptions.thresholds, valueDomain);
      } else {
        textObject = getSerieTextObj(value, currentOptions.standardOptions, currentOptions.valueMappings, currentOptions.thresholds, valueDomain, false);
      }

      newRow[field] = {
        ...textObject,
        valueDomain,
      };
    });
    return newRow;
  });
}
