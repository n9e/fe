import _ from 'lodash';
import { getMaxFontSize } from '../../utils/getTextWidth';

export interface IGrid {
  height: number;
  width: number;
  widthOnLastRow: number;
  xCount: number;
  yCount: number;
}

export const getMinFontSizeByList = (
  list: {
    name: string;
    value: string;
    unit: string;
  }[],
  options: {
    width: number;
    height: number;
    grid?: IGrid;
    orientation?: 'horizontal' | 'vertical';
    textMode?: string;
    valueField?: string;
  },
): {
  name: number;
  value: number;
} => {
  const { width, height, grid, orientation, textMode, valueField } = options;
  let xGrid = 0;
  let yGrid = 0;
  let nameFontSize;
  let valueFontSize;
  _.forEach(list, (item, index) => {
    let realWidth = width;
    let realHeight = height;
    if (grid) {
      const isLastRow = yGrid === grid.yCount - 1;
      realWidth = isLastRow ? grid.widthOnLastRow : grid.width;
      realHeight = grid.height;
      xGrid++;
      if (xGrid === grid.xCount) {
        xGrid = 0;
        yGrid++;
      }
    } else if (orientation) {
      realWidth = orientation === 'horizontal' ? (width as number) * (100 / list.length / 100) : width;
      realHeight = orientation === 'vertical' ? (height as number) * (100 / list.length / 100) : height;
    }
    const name = item.name;
    const value = valueField && valueField !== 'Value' ? _.get(item, ['metric', valueField]) : item.value;
    const valueAndUnit = `${value} ${item.unit}`;
    const nameFontSizeTemp = name && (textMode === 'valueAndName' || textMode === 'name') ? getMaxFontSize(name, (realWidth - 20) * 0.8, realHeight / 2 / 3) : 0;
    const valueFontSizeTemp =
      name && (textMode === 'valueAndName' || textMode === 'name')
        ? getMaxFontSize(valueAndUnit, (realWidth - 20) * 0.8, (realHeight / 2 / 3) * 2)
        : getMaxFontSize(valueAndUnit, (realWidth - 20) * 0.8, realHeight);
    if (index === 0) {
      nameFontSize = nameFontSizeTemp;
      valueFontSize = valueFontSizeTemp;
    } else {
      nameFontSize = Math.min(nameFontSize, nameFontSizeTemp);
      valueFontSize = Math.min(valueFontSize, valueFontSizeTemp);
    }
  });
  return {
    name: nameFontSize,
    value: valueFontSize,
  };
};
