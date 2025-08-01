import _ from 'lodash';

import { IOptions, IOverride, CellOptions } from '@/pages/dashboard/types';
import { getSerieTextObj } from '@/pages/dashboard/Renderer/utils/getCalculatedValuesBySeries';
import getOverridePropertiesByName from '@/pages/dashboard/Renderer/utils/getOverridePropertiesByName';

import { TextObject } from '../CellRenderer/types';
import calcValueDomainByRowData from './calcValueDomainByRowData';

export default function getFormattedRowData(
  rowData: { [key: string]: any }[],
  panelParams: {
    cellOptions: CellOptions;
    options: IOptions;
    overrides: IOverride[];
  },
) {
  const { options, overrides, cellOptions } = panelParams;
  return _.map(rowData, (row) => {
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

      let currentValue = value;
      let textObject = {} as Omit<TextObject, 'valueDomain'>;

      let valueDomain: [number, number] = [0, 100];

      if (_.isNumber(currentOptions.standardOptions.min) && _.isNumber(currentOptions.standardOptions.max)) {
        valueDomain = [currentOptions.standardOptions.min, currentOptions.standardOptions.max];
      } else if (currentCellOptions.type === 'gauge') {
        valueDomain = calcValueDomainByRowData(field, rowData);
      }

      if (!_.isNaN(_.toNumber(currentValue))) {
        currentValue = _.toNumber(currentValue);
        textObject = getSerieTextObj(value, currentOptions.standardOptions, currentOptions.valueMappings, currentOptions.thresholds, valueDomain);
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
