/**
 * 生成圆角六边形的 SVG 路径
 * @param {number} size - 六边形大小
 * @param {boolean} enableRounded - 是否启用圆角
 * @returns {string} SVG 路径字符串
 */

export default function getRoundedHexagonPath(size: number, enableRounded: boolean): string {
  // pointy 方向六边形的6个顶点坐标
  const points = [
    { x: 0, y: -size }, // 顶部
    { x: (size * Math.sqrt(3)) / 2, y: -size / 2 }, // 右上
    { x: (size * Math.sqrt(3)) / 2, y: size / 2 }, // 右下
    { x: 0, y: size }, // 底部
    { x: (-size * Math.sqrt(3)) / 2, y: size / 2 }, // 左下
    { x: (-size * Math.sqrt(3)) / 2, y: -size / 2 }, // 左上
  ];

  let path = '';

  // 如果启用圆角，计算合适的圆角半径（边长的 1/10）
  const r = enableRounded ? (Math.sqrt(3) * size) / 2 / 10 : 0;

  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const prev = points[(i - 1 + points.length) % points.length];

    // 计算从前一个点到当前点的向量
    const dx1 = current.x - prev.x;
    const dy1 = current.y - prev.y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

    // 计算从当前点到下一个点的向量
    const dx2 = next.x - current.x;
    const dy2 = next.y - current.y;
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    // 计算圆角的起点和终点
    const startX = current.x - (dx1 / len1) * r;
    const startY = current.y - (dy1 / len1) * r;
    const endX = current.x + (dx2 / len2) * r;
    const endY = current.y + (dy2 / len2) * r;

    if (i === 0) {
      path += `M ${startX} ${startY}`;
    } else {
      path += ` L ${startX} ${startY}`;
    }

    // 使用二次贝塞尔曲线绘制圆角
    if (enableRounded) {
      path += ` Q ${current.x} ${current.y} ${endX} ${endY}`;
    } else {
      path += ` L ${endX} ${endY}`;
    }
  }

  path += ' Z';
  return path;
}
