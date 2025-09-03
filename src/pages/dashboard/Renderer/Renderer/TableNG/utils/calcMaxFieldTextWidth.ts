import _ from 'lodash';

import { getFontStr } from '@/utils/getTextWidth';

import { TextObject } from '../CellRenderer/types';

export function getMaxTextWidth(texts: string[], font = getFontStr()) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.font = font;
  return _.max(_.map(texts, (text) => context.measureText(text).width)) || 0;
}

export default function calcMaxFieldTextWidth(field: string, formattedData: { [key: string]: TextObject }[]) {
  const textWidths = _.map(formattedData, (row) => row[field].text);
  const maxWidth = getMaxTextWidth(textWidths);
  return maxWidth + 8; // 预留 8px 的 padding
}
