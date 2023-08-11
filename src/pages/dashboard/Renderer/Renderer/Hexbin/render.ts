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
// @ts-nocheck
import { transition, min, select, event } from 'd3';
import { hexbin as d3Hexbin } from 'd3-hexbin';
import _ from 'lodash';
import { bestFitElemCountPerRow, getTextSizeForWidthAndHeight, getMapColumnsAndRows } from './utils';

const xmlns = 'http://www.w3.org/2000/svg';
const minFont = 6;
function getPlaceHolderElems(rows, columns, len, radius: number) {
  let points: any[] = [];
  for (let i = 0, count = 0; i < rows; i++) {
    for (let j = 0; j < columns && count <= len - 1; j++, count++) {
      points.push([radius * j * 1.75, radius * i * 1.5]);
    }
  }
  return points;
}
function computeTextFontSize(text: string, linesToDisplay: number, textAreaWidth: number, textAreaHeight: number): number {
  return getTextSizeForWidthAndHeight(text, textAreaWidth, textAreaHeight / linesToDisplay);
}
function getHexbinHeight(mapRows, hexRadius) {
  let count = 0;
  for (let i = 1; i <= mapRows; i++) {
    if (i === mapRows && i !== 1) {
      count += 1.5;
    } else if (i % 2 === 1) {
      count += 2;
    } else {
      count += 1;
    }
  }
  return count * hexRadius;
}

const div = select('body')
  .append(function () {
    return document.createElement('div');
  })
  .attr('class', 'hexbin-tooltip')
  .style('opacity', 0);

function renderHoneyComb(svgGroup, data, { width, height, fontAutoScale = true, fontSize = 12, themeMode, textMode, detailUrl }, detailFormatter) {
  const t = transition().duration(750);
  const { columns: mapColumns, rows: mapRows } = getMapColumnsAndRows(width, height, data.length);
  const hexRadius = Math.floor(min([width / ((mapColumns + 0.5) * Math.sqrt(3)), height / ((mapRows + 1 / 3) * 1.5), width / 7]));
  const hexbinWidth = Math.sin((60 * Math.PI) / 180) * hexRadius * 2;
  const points = getPlaceHolderElems(mapRows, mapColumns, data.length, hexRadius);
  let adjustedOffSetX = (width - hexbinWidth * mapColumns) / 2 + hexbinWidth / 2;
  if (points.length >= mapColumns * 2) {
    adjustedOffSetX = (width - hexbinWidth * mapColumns - hexbinWidth / 2) / 2 + hexbinWidth / 2;
  }
  const adjustedOffSetY = (height - getHexbinHeight(mapRows, hexRadius)) / 2 + hexRadius;
  const hexbin = d3Hexbin().radius(hexRadius);
  const translateX = adjustedOffSetX;
  const translateY = adjustedOffSetY;
  const hexbinPoints = hexbin(points);
  const textAreaHeight = hexRadius;
  const textAreaWidth = hexbinWidth * 0.9;
  let activeLabelFontSize = fontSize;
  let activeValueFontSize = fontSize;
  let isShowEllipses = false;
  let numOfChars = 0;

  if (fontAutoScale) {
    let maxLabel = '';
    let maxValue = '';
    for (let i = 0; i < data.length; i++) {
      if (data[i].name.length > maxLabel.length) {
        maxLabel = data[i].name;
      }
      if (_.toString(data[i].value).length > maxValue.length) {
        maxValue = _.toString(data[i].value);
      }
    }
    activeLabelFontSize = computeTextFontSize(maxLabel, 2, textAreaWidth, textAreaHeight);
    activeValueFontSize = computeTextFontSize(maxValue, 2, textAreaWidth, textAreaHeight);
    if (activeLabelFontSize < minFont) {
      isShowEllipses = true;
      numOfChars = 18;
      maxLabel = maxLabel.substring(0, numOfChars + 2);
      activeLabelFontSize = computeTextFontSize(maxLabel, 2, textAreaWidth, textAreaHeight);
      if (activeLabelFontSize < minFont) {
        numOfChars = 10;
        maxLabel = maxLabel.substring(0, numOfChars + 2);
        activeLabelFontSize = computeTextFontSize(maxLabel, 2, textAreaWidth, textAreaHeight);
        if (activeLabelFontSize < minFont) {
          numOfChars = 6;
          maxLabel = maxLabel.substring(0, numOfChars + 2);
          activeLabelFontSize = computeTextFontSize(maxLabel, 2, textAreaWidth, textAreaHeight);
        }
      }
    }
    // TODO: 暂时关闭序列名和值固定相同字体大小的设定
    // if (activeValueFontSize > activeLabelFontSize) {
    //   activeValueFontSize = activeLabelFontSize;
    // }
  }

  const valueWithLabelTextAlignment = textAreaHeight / 2 / 2;
  const labelWithValueTextAlignment = -(textAreaHeight / 2 / 2);

  svgGroup.attr('width', width).attr('height', height).attr('transform', `translate(${translateX},${translateY})`);

  const hexagons = svgGroup.selectAll('.hexagon').data(hexbinPoints);

  // 六边形
  hexagons
    .enter()
    .append(function () {
      const nodeToAdd = document.createElementNS(xmlns, 'path');
      return nodeToAdd;
    })
    .attr('class', 'hexagon')
    .on('mousemove', function (_d, i) {
      const metricObj = data[i]?.metric;
      const metricName = metricObj?.__name__ || 'value';
      const metricNameRow = `<div><strong>${metricName}: ${data[i]?.value}</strong></div>`;
      const labelsRows = _.map(_.omit(metricObj, '__name__'), (val, key) => {
        return `<div>${key}: ${val}</div>`;
      });
      const content = `${metricNameRow}${labelsRows.join('')}`;
      div.style('opacity', 0.9);
      div
        .html(content)
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 28 + 'px');

      const curPath = svgGroup.selectAll('.hexagon').nodes()[i];
      curPath.setAttribute('stroke', themeMode === 'dark' ? '#fff' : '#2A2D3C');
    })
    .on('mouseout', function (_d, i) {
      div.style('opacity', 0);
      const curPath = svgGroup.selectAll('.hexagon').nodes()[i];
      curPath.setAttribute('stroke', data[i]?.color);
    })
    .on('mousedown', (_d, i) => {
      if (detailUrl) {
        window.open(detailFormatter(data[i]), '_blank');
      }
    })
    .attr('stroke', (_d, i) => {
      return data[i]?.color;
    })
    .attr('stroke-width', '2px')
    .style('fill', (_d, i) => {
      return data[i]?.color;
    })
    .style('fill-opacity', 1)
    .transition(t)
    .attr('d', function (d) {
      return 'M' + d.x + ',' + d.y + hexbin.hexagon([hexRadius - 3]);
    });

  if (textMode === 'valueAndName' || textMode === 'name') {
    // 指标名
    hexagons
      .enter()
      .append('text')
      .attr('x', function (d) {
        return d.x;
      })
      .attr('y', function (d) {
        return d.y + (textMode === 'valueAndName' ? labelWithValueTextAlignment : 0);
      })
      .text(function (_d, i) {
        let name = data[i]?.name;
        if (isShowEllipses) {
          name = name.substring(0, numOfChars) + '...';
          return name;
        }
        return name;
      })
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .style('pointer-events', 'none')
      .style('font-size', activeLabelFontSize + 'px')
      .style('fill', 'black')
      .each(function (this, d) {
        d.bbox = this.getBBox();
      });
  }

  if (textMode === 'valueAndName' || textMode === 'value') {
    // 指标值
    hexagons
      .enter()
      .append('text')
      .attr('x', function (d) {
        return d.x;
      })
      .attr('y', function (d) {
        return d.y + (textMode === 'valueAndName' ? valueWithLabelTextAlignment : 0);
      })
      .text(function (_d, i) {
        const value = data[i]?.value;
        return value;
      })
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .style('font-size', activeValueFontSize + 'px')
      .style('fill', 'black')
      .style('pointer-events', 'none')
      .each(function (this, d) {
        d.bbox = this.getBBox();
      });
  }
}

export function renderFn(data, { width, height, parentGroupEl, themeMode, textMode, detailUrl }, detailFormatter) {
  const parentGroup = select(parentGroupEl).attr('width', width).attr('height', height);
  const countPerRow = bestFitElemCountPerRow(1, width, height);
  const unitWidth = Math.floor(width / countPerRow);
  const rowCount = Math.ceil(1 / countPerRow);
  const unitHeight = height / rowCount;

  renderHoneyComb(
    parentGroup,
    data,
    {
      width: unitWidth,
      height: unitHeight,
      themeMode,
      textMode,
      detailUrl,
    },
    detailFormatter,
  );
}
