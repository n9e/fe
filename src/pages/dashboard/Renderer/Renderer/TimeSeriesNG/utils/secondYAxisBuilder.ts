import _ from 'lodash';

import { axisBuilder } from '@/components/UPlotChart';

import { IPanel, IStandardOptions } from '../../../../types';
import valueFormatter from '../../../utils/valueFormatter';

export default function secondYAxisBuilder(panel: IPanel, darkMode: boolean) {
  const { options = {}, overrides } = panel;
  const rightYAxisDisplay = _.get(overrides, [0, 'properties', 'rightYAxisDisplay']);
  let standardOptions = options.standardOptions;

  if (rightYAxisDisplay === 'normal') {
    standardOptions = _.get(overrides, [0, 'properties', 'standardOptions']) as IStandardOptions | undefined;
    return [
      axisBuilder({
        scaleKey: 'y2',
        side: 1,
        theme: darkMode ? 'dark' : 'light',
        formatValue: (v) => {
          return valueFormatter(
            {
              unit: standardOptions?.unit,
              decimals: standardOptions?.decimals,
              dateFormat: standardOptions?.dateFormat,
            },
            v,
          ).text as string;
        },
      }),
    ];
  }
  return [];
}
