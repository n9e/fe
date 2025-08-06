import _ from 'lodash';

import { getTextWidth } from '@/pages/dashboard/Renderer/Renderer/Hexbin/utils';

import { TextObject } from '../CellRenderer/types';

export default function calcMaxFieldTextWidth(field: string, formattedData: { [key: string]: TextObject }[]) {
  const textWidths = _.map(formattedData, (row) => getTextWidth(row[field].text));
  return Math.max(...textWidths) + 8; // 预留 8px 的 padding
}
