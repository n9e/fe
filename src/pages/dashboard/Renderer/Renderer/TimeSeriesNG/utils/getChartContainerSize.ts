interface Size {
  width: number;
  height: number;
}

export default function getChartContainerSize(padding: number, containerSize?: Size, legendSize?: Size, placement?: string) {
  const containerWidth = containerSize?.width || 0;
  const containerHeight = containerSize?.height || 0;
  const legendWidth = legendSize?.width || 0;
  const legendHeight = legendSize?.height || 0;
  const chartContainerWidth = containerWidth - (placement === 'right' ? legendWidth : 0) - padding * 2;
  const chartContainerHeight = containerHeight - (placement === 'bottom' ? legendHeight : 0) - padding * 2;

  return { width: chartContainerWidth, height: chartContainerHeight };
}
