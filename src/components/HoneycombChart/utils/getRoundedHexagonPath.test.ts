import getRoundedHexagonPath from './getRoundedHexagonPath';

const SIZE = 10;

/** pointy-top 正六边形的 6 个顶点，上下各一个尖角。 */
const expectedVertices: Array<[number, number]> = [
  [0, -SIZE],
  [(SIZE * Math.sqrt(3)) / 2, -SIZE / 2],
  [(SIZE * Math.sqrt(3)) / 2, SIZE / 2],
  [0, SIZE],
  [(-SIZE * Math.sqrt(3)) / 2, SIZE / 2],
  [(-SIZE * Math.sqrt(3)) / 2, -SIZE / 2],
];

/** 圆角半径由 size 推导，比对顶点时抹掉浮点尾差。 */
const normalize = (points: ReadonlyArray<readonly [number, number]>) => points.map(([x, y]) => `${Math.round(x * 1e6) / 1e6},${Math.round(y * 1e6) / 1e6}`).sort();

const parseControls = (path: string): Array<[number, number]> =>
  (path.match(/Q [\d.-]+ [\d.-]+/g) ?? []).map((segment) => {
    const [, x, y] = segment.split(' ');
    return [Number(x), Number(y)];
  });

describe('getRoundedHexagonPath', () => {
  it('returns an empty path for a non-positive or non-finite size', () => {
    expect(getRoundedHexagonPath(0)).toBe('');
    expect(getRoundedHexagonPath(-1)).toBe('');
    expect(getRoundedHexagonPath(Number.NaN)).toBe('');
    expect(getRoundedHexagonPath(Number.POSITIVE_INFINITY)).toBe('');
  });

  it('builds a closed path with one quad corner per vertex', () => {
    const path = getRoundedHexagonPath(SIZE);

    expect(path.startsWith('M ')).toBe(true);
    expect(path.endsWith(' Z')).toBe(true);
    expect(path.match(/Q/g)).toHaveLength(6);
    expect(path.match(/L/g)).toHaveLength(5);
    expect(path).not.toMatch(/NaN|Infinity/);
  });

  it('rounds each corner around the matching hexagon vertex', () => {
    const controls = parseControls(getRoundedHexagonPath(SIZE));

    expect(controls).toHaveLength(6);
    expect(normalize(controls)).toEqual(normalize(expectedVertices));
  });

  it('scales the path with the hexagon size', () => {
    expect(parseControls(getRoundedHexagonPath(20))[0]).toEqual([0, -20]);
    expect(parseControls(getRoundedHexagonPath(40))[0]).toEqual([0, -40]);
  });
});
