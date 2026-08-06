import _ from 'lodash';
import { AlignedData } from 'uplot';

import { IStandardOptions, IValueMapping, IThresholds, IOverride } from '../../../../types';
import { getMappedTextObj } from '../../../utils/getCalculatedValuesBySeries';
import valueFormatter from '../../../utils/valueFormatter';
import { calculateVariance, calculateStdDev } from '../../../utils/calculateField';

import { BaseSeriesItem } from './getDataFrameAndBaseSeries';

interface Props {
  frames: AlignedData;
  baseSeries: BaseSeriesItem[];
  hexPalette: string[];
  standardOptions?: IStandardOptions;
  valueMappings?: IValueMapping[];
  thresholds?: IThresholds;
  overrides?: IOverride[];
}

interface ColData {
  value: number;
  unit?: string;
  text: string;
  // valueFormatter 返回值携带的原始值（运行时存在，类型上可选）
  stat?: number | string | null | undefined;
}

export interface DataItem {
  id: string;
  name: string;
  metric: Record<string, string | undefined>;
  min: ColData;
  max: ColData;
  avg: ColData;
  last: ColData;
  sum: ColData;
  offset?: string | number;
  color: string;
  show: boolean;
}

function getUnit(standardOptions?: IStandardOptions) {
  return standardOptions?.unit;
}

export default function getLegendData(props: Props): DataItem[] {
  const { frames, baseSeries, hexPalette, standardOptions, valueMappings, thresholds, overrides } = props;
  let { decimals, dateFormat } = standardOptions || {};
  let unit = getUnit(standardOptions);
  const data = _.map(_.slice(frames, 1), (item, idx) => {
    const seriesItem = baseSeries[idx];
    const override = _.find(overrides, (item) => item.matcher?.value === seriesItem.n9e_internal.refId);
    const overrideStandardOptions = override?.properties?.standardOptions as IStandardOptions | undefined;
    if (override) {
      unit = overrideStandardOptions?.unit;
      decimals = overrideStandardOptions?.decimals;
      dateFormat = overrideStandardOptions?.dateFormat;
    }
    // undefined 值是 series 占位的假补点值，不参与统计计算
    const vaildValues = _.filter(item, (n) => n !== undefined);
    const statValues = {
      max: _.max(vaildValues),
      min: _.min(vaildValues),
      avg: _.mean(vaildValues),
      sum: _.sum(vaildValues),
      last: _.last(vaildValues),
      variance: calculateVariance(vaildValues as number[]),
      stdDev: calculateStdDev(vaildValues as number[]),
    };
    const fmtValue = (v: number | string | null | undefined) => valueFormatter({ unit, decimals, dateFormat }, v) as unknown as ColData;
    return {
      id: seriesItem.n9e_internal.id,
      name: getMappedTextObj(seriesItem.label, valueMappings)?.text as string,
      metric: _.reduce(
        seriesItem.n9e_internal.metric,
        (pre, curVal, curKey) => {
          pre[curKey] = getMappedTextObj(curVal, valueMappings)?.text as string | undefined;
          return pre;
        },
        {} as Record<string, string | undefined>,
      ),
      offset: seriesItem.n9e_internal.offset,
      color: hexPalette[idx % hexPalette.length],
      show: seriesItem.show,
      max: fmtValue(statValues.max),
      min: fmtValue(statValues.min),
      avg: fmtValue(statValues.avg),
      sum: fmtValue(statValues.sum),
      last: fmtValue(statValues.last),
      variance: fmtValue(statValues.variance),
      stdDev: fmtValue(statValues.stdDev),
    };
  });

  return data;
}
