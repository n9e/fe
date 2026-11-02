import calculateHexCoordinates from './calculateHexCoordinates';
import type { HexLayout } from './calculateHexCoordinates';

const emptyLayout: HexLayout = {
  coordinates: [],
  hexSize: 0,
  viewBoxWidth: 0,
  viewBoxHeight: 0,
  minX: 0,
  minY: 0,
};

/** 第一行（r = 0）的单元格数，等价于列数。 */
const columnsOf = (layout: HexLayout) => layout.coordinates.filter((item) => item.r === 0).length;
const rowsOf = (layout: HexLayout) => Math.max(...layout.coordinates.map((item) => item.r)) + 1;

describe('calculateHexCoordinates', () => {
  it('returns an empty layout when the inputs cannot produce cells', () => {
    expect(calculateHexCoordinates(0, 800, 600)).toEqual(emptyLayout);
    expect(calculateHexCoordinates(-1, 800, 600)).toEqual(emptyLayout);
    expect(calculateHexCoordinates(10, 0, 600)).toEqual(emptyLayout);
    expect(calculateHexCoordinates(10, 800, 0)).toEqual(emptyLayout);
    expect(calculateHexCoordinates(10, Number.NaN, 600)).toEqual(emptyLayout);
    expect(calculateHexCoordinates(10, 800, Number.POSITIVE_INFINITY)).toEqual(emptyLayout);
  });

  it('emits exactly one coordinate per cell with usable dimensions', () => {
    [1, 3, 7, 100].forEach((count) => {
      const layout = calculateHexCoordinates(count, 800, 600);

      expect(layout.coordinates).toHaveLength(count);
      expect(layout.hexSize).toBeGreaterThan(0);
      expect(layout.viewBoxWidth).toBeGreaterThan(0);
      expect(layout.viewBoxHeight).toBeGreaterThan(0);
    });
  });

  it('keeps s = -q - r so every coordinate stays on the hex grid', () => {
    const layout = calculateHexCoordinates(23, 800, 600);

    layout.coordinates.forEach(({ q, r, s }) => {
      expect(s).toBe(-q - r);
    });
  });

  it('offsets each row by half a cell every two rows so the cells interlock', () => {
    const layout = calculateHexCoordinates(23, 800, 600);
    const minQByRow = new Map<number, number>();

    layout.coordinates.forEach(({ q, r }) => {
      const current = minQByRow.get(r);
      if (current === undefined || q < current) {
        minQByRow.set(r, q);
      }
    });

    expect(minQByRow.size).toBeGreaterThan(1);
    // 行 r 的起始 q 恰好抵消 floor(r / 2) 个格子，即每两行错开半格
    minQByRow.forEach((minQ, r) => {
      expect(minQ + Math.floor(r / 2)).toBe(0);
    });
  });

  it('picks a square arrangement for a square container', () => {
    const layout = calculateHexCoordinates(4, 1000, 1000);
    // s = -q - r 由专门的用例覆盖，这里只比对行列坐标
    const positions = layout.coordinates.map(({ q, r }) => [q, r]);

    expect(positions).toEqual([
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]);
    expect(layout.minX).toBeLessThan(0);
    expect(layout.minY).toBeLessThan(0);
  });

  it('leaves the last row partially filled when the count is not a multiple of the columns', () => {
    const layout = calculateHexCoordinates(3, 1000, 1000);

    expect(layout.coordinates).toHaveLength(3);
    expect(layout.coordinates.filter((item) => item.r === 1)).toHaveLength(1);
  });

  it('prefers a wide arrangement for a wide container and a tall one for a tall container', () => {
    const wide = calculateHexCoordinates(100, 1000, 200);
    const tall = calculateHexCoordinates(100, 200, 1000);

    expect(columnsOf(wide)).toBeGreaterThan(columnsOf(tall));
    expect(rowsOf(wide)).toBeLessThan(rowsOf(tall));
  });

  it('gives every cell more room as the container grows', () => {
    const small = calculateHexCoordinates(20, 400, 300);
    const large = calculateHexCoordinates(20, 800, 600);

    expect(large.hexSize).toBeGreaterThan(small.hexSize);
  });
});
