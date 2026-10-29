export interface HexCoordinate {
  q: number;
  r: number;
  s: number;
}

export interface HexLayout {
  coordinates: HexCoordinate[];
  hexSize: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  minX: number;
  minY: number;
}

const emptyLayout = (): HexLayout => ({
  coordinates: [],
  hexSize: 0,
  viewBoxWidth: 0,
  viewBoxHeight: 0,
  minX: 0,
  minY: 0,
});

/** Calculate a compact pointy-top hex layout for the given panel size. */
export default function calculateHexCoordinates(count: number, containerWidth: number, containerHeight: number, spacing = 1.02): HexLayout {
  if (count <= 0 || containerWidth <= 0 || containerHeight <= 0 || !Number.isFinite(containerWidth) || !Number.isFinite(containerHeight)) {
    return emptyLayout();
  }

  const aspectRatio = containerWidth / containerHeight;
  let bestRows = 0;
  let bestCols = 0;
  let bestSize = 0;
  let bestScore = -Infinity;

  for (let rows = 1; rows <= count; rows++) {
    const cols = Math.ceil(count / rows);
    const widthPerHex = containerWidth / (cols * Math.sqrt(3) * spacing);
    const heightPerHex = containerHeight / (rows * 1.5 * spacing);
    const hexSize = Math.min(widthPerHex, heightPerHex);
    const layoutAspectRatio = (cols * Math.sqrt(3)) / (rows * 1.5);
    const aspectRatioDiff = Math.abs(layoutAspectRatio - aspectRatio) / aspectRatio;
    const score = -aspectRatioDiff + hexSize * 0.01;

    if (score > bestScore) {
      bestScore = score;
      bestSize = hexSize;
      bestRows = rows;
      bestCols = cols;
    }
  }

  if (bestSize <= 0) {
    return emptyLayout();
  }

  const coordinates: HexCoordinate[] = [];
  for (let row = 0; row < bestRows; row++) {
    for (let col = 0; col < bestCols; col++) {
      const index = row * bestCols + col;
      if (index >= count) break;

      const q = col - Math.floor(row / 2);
      const r = row;
      coordinates.push({ q, r, s: -q - r });
    }
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  coordinates.forEach(({ q, r }) => {
    const x = bestSize * Math.sqrt(3) * (q + r / 2) * spacing;
    const y = bestSize * 1.5 * r * spacing;
    const halfWidth = (bestSize * Math.sqrt(3)) / 2;
    const halfHeight = bestSize;

    minX = Math.min(minX, x - halfWidth);
    maxX = Math.max(maxX, x + halfWidth);
    minY = Math.min(minY, y - halfHeight);
    maxY = Math.max(maxY, y + halfHeight);
  });

  return {
    coordinates,
    hexSize: bestSize,
    viewBoxWidth: maxX - minX,
    viewBoxHeight: maxY - minY,
    minX,
    minY,
  };
}
