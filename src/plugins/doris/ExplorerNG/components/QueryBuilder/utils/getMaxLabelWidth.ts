import _ from 'lodash';

import getTextWidth from '@/utils/getTextWidth';

export default function getMaxLabelWidth(labels: string[]): number {
  let maxWidth = 36;
  _.forEach(labels, (label) => {
    const width = getTextWidth(label);
    if (width > maxWidth) {
      maxWidth = width;
    }
  });
  return maxWidth + 8; // add padding
}
