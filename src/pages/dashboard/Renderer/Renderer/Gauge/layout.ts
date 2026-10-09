import { calculateGridDimensions } from '../../utils/squares';

export interface GaugeLayoutItem {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type GaugeOrientation = 'auto' | 'horizontal' | 'vertical';

export const calculateGaugeLayout = (parentWidth: number, parentHeight: number, itemSpacing: number, itemCount: number, orientation: GaugeOrientation): GaugeLayoutItem[] => {
  if (parentWidth <= 0 || parentHeight <= 0 || itemCount <= 0) return [];

  if (orientation === 'horizontal') {
    const gap = Math.min(itemSpacing, parentWidth / Math.max(1, itemCount - 1));
    const itemWidth = (parentWidth - gap * (itemCount - 1)) / itemCount;
    return Array.from({ length: itemCount }, (_, index) => ({
      left: index * (itemWidth + gap),
      top: 0,
      width: itemWidth,
      height: parentHeight,
    }));
  }

  if (orientation === 'vertical') {
    const gap = Math.min(itemSpacing, parentHeight / Math.max(1, itemCount - 1));
    const itemHeight = (parentHeight - gap * (itemCount - 1)) / itemCount;
    return Array.from({ length: itemCount }, (_, index) => ({
      left: 0,
      top: index * (itemHeight + gap),
      width: parentWidth,
      height: itemHeight,
    }));
  }

  const safeSpacing = Math.min(itemSpacing, parentWidth / Math.max(1, itemCount - 1), parentHeight / Math.max(1, itemCount - 1));
  const grid = calculateGridDimensions(parentWidth, parentHeight, safeSpacing, itemCount);

  return Array.from({ length: itemCount }, (_, index) => {
    const row = Math.floor(index / grid.xCount);
    const column = index % grid.xCount;
    const isLastRow = row === grid.yCount - 1;
    const width = isLastRow ? grid.widthOnLastRow : grid.width;
    return {
      left: column * (width + safeSpacing),
      top: row * (grid.height + safeSpacing),
      width,
      height: grid.height,
    };
  });
};
