import _ from 'lodash';

import getTextWidth from '@/utils/getTextWidth';

const buffer = 2;

// 计算每列的宽度，根据数据内容来计算，取最大值
export default function calcColWidthByData(data: any[]) {
  const colWidths: { [key: string]: number } = {};

  _.forEach(data, (row) => {
    _.forEach(row, (value, key) => {
      const text = _.toString(value);
      const textWidth =
        getTextWidth(text, {
          fontWeight: '700',
        }) + buffer;
      const keyWidth =
        getTextWidth(key, {
          fontWeight: '700',
        }) + buffer;
      const totalWidth = Math.max(textWidth, keyWidth);

      if (!colWidths[key] || totalWidth > colWidths[key]) {
        colWidths[key] = totalWidth;
      }
    });
  });

  // 设置一个最大宽度，防止某些字段内容过长导致表格撑破屏幕
  const MAX_COL_WIDTH = 600;
  _.forEach(colWidths, (width, key) => {
    if (width > MAX_COL_WIDTH) {
      colWidths[key] = MAX_COL_WIDTH;
    }
  });

  return colWidths;
}
