/** Create the SVG path for a pointy-top hexagon with rounded corners. */
export default function getRoundedHexagonPath(size: number): string {
  if (size <= 0 || !Number.isFinite(size)) return '';

  const points = [
    { x: 0, y: -size },
    { x: (size * Math.sqrt(3)) / 2, y: -size / 2 },
    { x: (size * Math.sqrt(3)) / 2, y: size / 2 },
    { x: 0, y: size },
    { x: (-size * Math.sqrt(3)) / 2, y: size / 2 },
    { x: (-size * Math.sqrt(3)) / 2, y: -size / 2 },
  ];
  const radius = (Math.sqrt(3) * size) / 20;

  return `${points
    .map((current, index) => {
      const next = points[(index + 1) % points.length];
      const previous = points[(index - 1 + points.length) % points.length];
      const dx1 = current.x - previous.x;
      const dy1 = current.y - previous.y;
      const dx2 = next.x - current.x;
      const dy2 = next.y - current.y;
      const length1 = Math.hypot(dx1, dy1);
      const length2 = Math.hypot(dx2, dy2);
      const startX = current.x - (dx1 / length1) * radius;
      const startY = current.y - (dy1 / length1) * radius;
      const endX = current.x + (dx2 / length2) * radius;
      const endY = current.y + (dy2 / length2) * radius;
      const command = index === 0 ? 'M' : 'L';

      return `${command} ${startX} ${startY} Q ${current.x} ${current.y} ${endX} ${endY}`;
    })
    .join(' ')} Z`;
}
