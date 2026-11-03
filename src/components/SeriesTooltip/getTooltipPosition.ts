export interface TooltipPoint {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

const POINTER_GAP = 10;
const VIEWPORT_MARGIN = 12;

/** fixed 浮层使用视口坐标；空间不足时翻转，再将位置限制在视口边距内。 */
export default function getTooltipPosition(pointer: TooltipPoint, tooltip: Size, viewport: Size) {
  const left = pointer.x + POINTER_GAP + tooltip.width > viewport.width - VIEWPORT_MARGIN ? pointer.x - POINTER_GAP - tooltip.width : pointer.x + POINTER_GAP;
  const top = pointer.y + POINTER_GAP + tooltip.height > viewport.height - VIEWPORT_MARGIN ? pointer.y - POINTER_GAP - tooltip.height : pointer.y + POINTER_GAP;

  return {
    left: Math.max(VIEWPORT_MARGIN, Math.min(left, viewport.width - tooltip.width - VIEWPORT_MARGIN)),
    top: Math.max(VIEWPORT_MARGIN, Math.min(top, viewport.height - tooltip.height - VIEWPORT_MARGIN)),
  };
}
