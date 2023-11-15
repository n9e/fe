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
import React from 'react';
import { Pie, PieConfig, measureTextWidth } from '@ant-design/plots';
import _ from 'lodash';

type Marker = {
  symbol?: string;
  spacing?: number;
};

interface ListItem extends DataType {
  marker?: Marker | string;
}

type DataType = {
  name: string;
  value: number;
  metric: any;
};
interface Props {
  data: DataType[];
  positon: 'top' | 'left' | 'right' | 'bottom';
  hidden: boolean;
  labelWithName: boolean;
  labelWithValue: boolean;
  dataFormatter: Function;
  detailFormatter: Function;
  detailName?: string;
  detailUrl?: string;
  themeMode?: 'dark';
  donut?: boolean;
}

function renderStatistic(containerWidth, text, style) {
  containerWidth = containerWidth - 20;
  const textWidth = measureTextWidth(text, style);
  const textHeight = 12;
  const R = containerWidth / 2.5; // r^2 = (w / 2)^2 + (h - offsetY)^2

  let scale = 1;

  if (containerWidth < textWidth) {
    scale = Math.min(Math.sqrt(Math.abs(Math.pow(R, 2) / (Math.pow(textWidth / 2, 2) + Math.pow(textHeight, 2)))), 1);
  }

  const textStyleStr = `width:${containerWidth}px;`;
  return `<div style="${textStyleStr};font-size:${scale}em;line-height:${scale < 1 ? 1 : 'inherit'};">${text}</div>`;
}

const DemoPie = (props: Props) => {
  const { data, positon, hidden, labelWithName, labelWithValue, themeMode, detailName, detailUrl, donut, dataFormatter, detailFormatter } = props;

  const config: PieConfig = {
    padding: [16, 8, 16, 8],
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'name',
    radius: 0.9,
    innerRadius: donut ? 0.6 : 0,
    label: {
      type: 'spider',
      content: (record) => {
        return `${labelWithName ? `${record.name}: ` : ''}${labelWithValue ? dataFormatter(record.value) : `${(record.percent * 100).toFixed(0)}%`}`;
      },
      style: {
        fontSize: 12,
        textAlign: 'center',
        fillStyle: themeMode === 'dark' ? '#fff' : '#333',
      },
    },
    statistic: {
      title: {
        offsetY: 16,
        style: {
          color: themeMode === 'dark' ? '#ABADBA' : 'unset',
        },
        customHtml: (container, _view, datum) => {
          const { width, height } = container.getBoundingClientRect();
          const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
          const text = datum ? datum.name : 'Total';
          return renderStatistic(d, text, {
            fontSize: 28,
          });
        },
      },
      content: {
        offsetY: -16,
        style: {
          color: themeMode === 'dark' ? '#fff' : 'unset',
        },
        customHtml: (container, _view, datum, data) => {
          const { width } = container.getBoundingClientRect();
          let text_num = datum ? `${datum.value}` : `${data?.reduce((r, d) => r + d.value, 0)}`;
          // 解决计算精度丢失问题, 数据精度使用传入数据的精度, 使用父级组件的dataFormatter
          const text = dataFormatter(Number.parseFloat(_.toNumber(text_num).toFixed(12)));
          return renderStatistic(width, text, {
            fontSize: 36,
          });
        },
      },
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    tooltip: {
      position: 'top',
      offset: 2,
      enterable: true,
      fields: ['name', 'value', 'metric'],
      formatter: (datum) => {
        const detailDom = detailUrl && datum.name !== 'Other' ? `&nbsp;|&nbsp;<span><a href=${detailFormatter(datum)} target="_blank">${detailName}</a></span>` : '';
        return { name: datum.name, value: dataFormatter(datum.value) + detailDom };
      },
    },
    legend: hidden
      ? false
      : {
          position: positon,
        },
  };
  return <Pie {...config} />;
};

export default DemoPie;
