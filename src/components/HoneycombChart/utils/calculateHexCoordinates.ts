/**
 * 计算蜂窝图中每个六边形的立方体坐标和合适的尺寸
 * @param {number} count - 输入数据集数量
 * @param {number} spacing - 六边形之间的间距
 * @param {number} containerWidth - 容器宽度
 * @param {number} containerHeight - 容器高度
 * @returns {{
 *   coordinates: Array<{q: number, r: number, s: number}>,
 *   hexSize: number,
 *   rows: number,
 *   cols: number,
 *   viewBoxWidth: number,
 *   viewBoxHeight: number,
 *   minX: number,
 *   minY: number
 * }} 立方体坐标数组和六边形尺寸
 */

export default function calculateHexCoordinates(
  count: number,
  spacing = 1,
  containerWidth: number,
  containerHeight: number,
): {
  coordinates: { q: number; r: number; s: number }[];
  hexSize: number;
  rows: number;
  cols: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  minX: number;
  minY: number;
} {
  const n = count;
  if (n === 0)
    return {
      coordinates: [],
      hexSize: 10,
      rows: 0,
      cols: 0,
      viewBoxWidth: 0,
      viewBoxHeight: 0,
      minX: 0,
      minY: 0,
    };

  // 容器宽高比
  const aspectRatio = containerWidth / containerHeight;

  // 1. 初始化最佳布局参数
  let bestRows = 0;
  let bestCols = 0;
  let bestSize = 0;
  let bestScore = -Infinity;

  // 2. 遍历所有可能的行数布局,找到最优布局
  for (let rows = 1; rows <= n; rows++) {
    const cols = Math.ceil(n / rows);

    // 3. 根据行列数计算合适的六边形尺寸（pointy 方向）
    // pointy 方向：宽度 = cols * sqrt(3) * hexSize，高度 = rows * 1.5 * hexSize
    const widthPerHex = containerWidth / (cols * Math.sqrt(3) * spacing);
    const heightPerHex = containerHeight / (rows * 1.5 * spacing);
    const hexSize = Math.min(widthPerHex, heightPerHex);

    // 4. 计算布局的宽高比与容器宽高比的匹配度
    const layoutAspectRatio = (cols * Math.sqrt(3)) / (rows * 1.5);
    const aspectRatioDiff = Math.abs(layoutAspectRatio - aspectRatio) / aspectRatio;

    // 优先选择宽高比匹配的布局，然后再选尺寸大的
    // 权重：宽高比匹配度权重大，尺寸权重小
    const score = -aspectRatioDiff + hexSize * 0.01;

    if (score > bestScore) {
      bestScore = score;
      bestSize = hexSize;
      bestRows = rows;
      bestCols = cols;
    }
  }

  // 5. 生成立方体坐标系
  const coordinates: { q: number; r: number; s: number }[] = [];
  for (let i = 0; i < bestRows; i++) {
    for (let j = 0; j < bestCols; j++) {
      const index = i * bestCols + j;
      if (index >= n) break;

      const q = j - Math.floor(i / 2);
      const r = i;
      const s = -q - r;
      coordinates.push({ q, r, s });
    }
  }

  // 6. 计算实际的六边形范围，用于正确显示
  // 根据 react-hexgrid 的布局，六边形的实际坐标会受到 spacing 的影响
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  coordinates.forEach(({ q, r }) => {
    // react-hexgrid 在计算位置时会应用 spacing
    const x = bestSize * Math.sqrt(3) * (q + r / 2) * spacing;
    const y = bestSize * 1.5 * r * spacing;
    const hw = (bestSize * Math.sqrt(3)) / 2;
    const hh = bestSize;

    minX = Math.min(minX, x - hw);
    maxX = Math.max(maxX, x + hw);
    minY = Math.min(minY, y - hh);
    maxY = Math.max(maxY, y + hh);
  });

  // 计算实际的宽高
  const actualWidth = maxX - minX;
  const actualHeight = maxY - minY;

  return {
    coordinates,
    hexSize: bestSize,
    rows: bestRows,
    cols: bestCols,
    viewBoxWidth: actualWidth,
    viewBoxHeight: actualHeight,
    minX,
    minY,
  };
}
