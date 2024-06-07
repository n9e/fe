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
  width: number,
  height: number,
  grid?: IGrid,
  orientation?: 'horizontal' | 'vertical',
): {
  name: number;
  value: number;
} => {
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
    const valueAndUnit = `${item.value} ${item.unit}`;
    const nameFontSizeTemp = getMaxFontSize(name, (realWidth - 20) * 0.8, realHeight / 2 / 3);
    const valueFontSizeTemp = getMaxFontSize(valueAndUnit, (realWidth - 20) * 0.8, (realHeight / 2 / 3) * 2);
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
