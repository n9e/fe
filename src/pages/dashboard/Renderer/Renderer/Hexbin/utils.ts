/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import _ from 'lodash';

export function bestFitElemCountPerRow(bucketLen, width, height) {
  let countPerRow = bucketLen;
  for (let r = 1, base = Infinity; r <= bucketLen; r += 1) {
    const w = Math.floor(width / r);
    const h = (2 * w) / 3;
    const netSpaceLost = Math.abs(width * height - bucketLen * w * h);
    if (netSpaceLost < base) {
      base = netSpaceLost;
      countPerRow = r;
      bucketLen = Math.ceil(bucketLen / r);
    }
  }
  return countPerRow;
}

export function getTextSizeForWidthAndHeight(text: string, width: number, height: number) {
  const minFontPx = 6;
  const maxFontPx = 24;
  let w = getTextWidth(
    text,
    getFontStr({
      ...defaultFont,
      fontSize: maxFontPx + 'px',
    }),
  );
  width = width * 0.95;
  if (w <= width && maxFontPx <= height) {
    return maxFontPx;
  }
  for (let fontSize = maxFontPx; fontSize >= minFontPx; fontSize--) {
    w = getTextWidth(
      text,
      getFontStr({
        ...defaultFont,
        fontSize: fontSize + 'px',
      }),
    );
    if (w < width && fontSize <= height) {
      return Math.ceil(fontSize);
    }
  }
  return 0;
}

export const defaultFont = {
  fontWeight: 'normal',
  fontSize: '12px',
  fontFamily: 'Helvetica Neue,sans-serif,PingFangSC-Regular,microsoft yahei ui,microsoft yahei,simsun,"sans-serif"',
};

export const getFontStr = (font = defaultFont) => {
  return `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
};

export function getTextWidth(text: string, font = getFontStr()) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

function getCssStyle(element: HTMLElement, prop: string) {
  return window.getComputedStyle(element, null).getPropertyValue(prop);
}

export function getCanvasFontSize(el = document.body) {
  const fontWeight = getCssStyle(el, 'font-weight') || defaultFont.fontWeight;
  const fontSize = getCssStyle(el, 'font-size') || defaultFont.fontSize;
  const fontFamily = getCssStyle(el, 'font-family') || defaultFont.fontFamily;

  return `${fontWeight} ${fontSize} ${fontFamily}`;
}

export function getColorScaleLinearDomain(calculatedValues: any[], colorDomainAuto: boolean, colorDomain: number[]) {
  if (!colorDomainAuto && colorDomain?.length) {
    return [colorDomain[0], (colorDomain[0] + colorDomain[1]) / 2, colorDomain[1]];
  }
  const min = _.get(_.minBy(calculatedValues, 'stat'), 'stat');
  const max = _.get(_.maxBy(calculatedValues, 'stat'), 'stat');
  if (min !== undefined && max !== undefined) {
    return [min, (max + min) / 2, max];
  }
  return [];
}

export function getMapColumnsAndRows(width: number, height: number, dataSize: number) {
  let numColumns = 0;
  let numRows = 0;
  const squared = Math.sqrt(dataSize);
  if (width > height) {
    numColumns = Math.ceil((width / height) * squared * 0.75);
    if (numColumns < 1) {
      numColumns = 1;
    } else if (numColumns > dataSize) {
      numColumns = dataSize;
    }

    numRows = Math.ceil(dataSize / numColumns);
    if (numRows < 1) {
      numRows = 1;
    }
  } else {
    numRows = Math.ceil((height / width) * squared * 0.75);
    if (numRows < 1) {
      numRows = 1;
    } else if (numRows > dataSize) {
      numRows = dataSize;
    }
    numColumns = Math.ceil(dataSize / numRows);
    if (numColumns < 1) {
      numColumns = 1;
    }
  }
  return {
    columns: numColumns,
    rows: numRows,
  };
}
