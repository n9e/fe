import _ from 'lodash';
import { AlignedData } from 'uplot';

import { IValueMapping, IThresholds, IOverride } from '../../../../types';
import { getMappedTextObj } from '../../../utils/getCalculatedValuesBySeries';
import valueFormatter from '../../../utils/valueFormatter';

import { BaseSeriesItem } from './getDataFrameAndBaseSeries';

interface Props {
  frames: AlignedData;
  baseSeries: BaseSeriesItem[];
  hexPalette: string[];
  standardOptions?: any;
  valueMappings?: IValueMapping[];
  thresholds?: IThresholds;
  overrides?: IOverride[];
}

interface ColData {
  value: number;
  unit?: string;
  text: string;
}

export interface DataItem {
  id: string;
  name: string;
  min: ColData;
  max: ColData;
  avg: ColData;
  last: ColData;
  sum: ColData;
  offset: string;
  color: string;
  show: boolean;
}

function getUnit(standardOptions: any) {
  return standardOptions?.unit || standardOptions?.util; // TODO: 兼容之前写错的 util
}

export default function getLegendData(props: Props): DataItem[] {
  const { frames, baseSeries, hexPalette, standardOptions, valueMappings, thresholds, overrides } = props;
  let { decimals, dateFormat } = standardOptions || {};
  let unit = getUnit(standardOptions);
  const data = _.map(_.slice(frames, 1), (item, idx) => {
    const seriesItem = baseSeries[idx];
    const override = _.find(overrides, (item) => item.matcher?.value === seriesItem.n9e_internal.refId);
    if (override) {
      unit = override?.properties?.standardOptions?.util;
      decimals = override?.properties?.standardOptions?.decimals;
      dateFormat = override?.properties?.standardOptions?.dateFormat;
    }
    const statValues = {
      max: _.max(item),
      min: _.min(item),
      avg: _.mean(item),
      sum: _.sum(item),
      last: _.last(item),
    };
    return {
      id: seriesItem.n9e_internal.id,
      name: getMappedTextObj(seriesItem.label, valueMappings)?.text,
      metric: _.reduce(
        seriesItem.n9e_internal.metric,
        (pre, curVal, curKey) => {
          pre[curKey] = getMappedTextObj(curVal, valueMappings)?.text;
          return pre;
        },
        {},
      ),
      offset: seriesItem.n9e_internal.offset,
      color: hexPalette[idx % hexPalette.length],
      show: seriesItem.show,
      max: valueFormatter({ unit, decimals, dateFormat }, statValues.max),
      min: valueFormatter({ unit, decimals, dateFormat }, statValues.min),
      avg: valueFormatter({ unit, decimals, dateFormat }, statValues.avg),
      sum: valueFormatter({ unit, decimals, dateFormat }, statValues.sum),
      last: valueFormatter({ unit, decimals, dateFormat }, statValues.last),
    };
  });

  return data;
}
