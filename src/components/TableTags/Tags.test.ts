/// <reference types="jest" />

// mock 掉有副作用或 ESM 专属语法的依赖，只测纯逻辑
jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('react', () => ({}));
jest.mock('antd', () => ({}));
jest.mock('@ant-design/icons', () => ({}));
jest.mock('react-i18next', () => ({}));

import { calcLayout } from './Tags';

// GAP = 2（与源码保持一致）

describe('calcLayout', () => {
  // ────────────────────── 边界情况 ──────────────────────

  it('空数组时返回 visibleCount=0, overflowCount=0', () => {
    expect(calcLayout([], 40, 200)).toEqual({ visibleCount: 0, overflowCount: 0 });
  });

  it('containerWidth <= 0 时直接返回所有 tag 可见', () => {
    expect(calcLayout([50, 60, 70], 40, 0)).toEqual({ visibleCount: 3, overflowCount: 0 });
    expect(calcLayout([50, 60, 70], 40, -1)).toEqual({ visibleCount: 3, overflowCount: 0 });
  });

  it('单个 tag 且恰好填满第一行', () => {
    expect(calcLayout([100], 30, 100)).toEqual({ visibleCount: 1, overflowCount: 0 });
  });

  it('单个 tag 且宽度被容器宽度截断后仍可放入第一行', () => {
    // 宽 300 > 容器 200，clamp 后为 200，恰好放入
    expect(calcLayout([300], 30, 200)).toEqual({ visibleCount: 1, overflowCount: 0 });
  });

  // ────────────────────── 第一行全部放下 ──────────────────────

  it('所有 tag 均可放入第一行（宽松容器）', () => {
    // 50 + 2+60 + 2+70 = 184 <= 300
    expect(calcLayout([50, 60, 70], 40, 300)).toEqual({ visibleCount: 3, overflowCount: 0 });
  });

  it('所有 tag 恰好填满第一行（边界等于）', () => {
    // 100 + (2+48) = 150
    expect(calcLayout([100, 48], 30, 150)).toEqual({ visibleCount: 2, overflowCount: 0 });
  });

  it('只有一个 tag 放入第一行，其余全部溢出（无法放入第二行）', () => {
    // 容器 120；第一行：100 → rem=20
    // 第二行 r2start=1：tag2=90 (isFirst,isLast); rem(120)>=90 → r2count=1
    // visibleCount=2, overflowCount=0
    expect(calcLayout([100, 90], 30, 120)).toEqual({ visibleCount: 2, overflowCount: 0 });
  });

  // ────────────────────── 两行布局（有溢出指示器）──────────────────────

  it('第二行放入部分 tag，剩余作为溢出', () => {
    // 容器 120, overflowTag=30
    // 第一行：50(rem=70) + 2+50=52(rem=18) → row1End=1；第三个放不下
    // 第二行 r2start=2：
    //   i=2(isFirst, not isLast): needed=50, 需 50+2+30=82 <= 120 ✓ → rem=70, r2count=1
    //   i=3(not isFirst, not isLast): needed=2+50=52, 需 52+2+30=84 <= 70? ✗ → break
    // visibleCount=3, overflowCount=4
    expect(calcLayout([50, 50, 50, 50, 50, 50, 50], 30, 120)).toEqual({ visibleCount: 3, overflowCount: 4 });
  });

  it('第二行最后一个 tag 恰好能放入（isLast 分支）', () => {
    // 容器 100, overflowTag=30
    // 第一行：50(rem=50)；2+60=62 > 50 → row1End=0
    // 第二行 r2start=1：
    //   i=1(isFirst, not isLast): needed=60, 需 60+2+30=92 <= 100 ✓ → rem=40, r2count=1
    //   i=2(not isFirst, isLast): needed=2+30=32 <= 40 ✓ → r2count=2, break
    // visibleCount=3, overflowCount=0
    expect(calcLayout([50, 60, 30], 30, 100)).toEqual({ visibleCount: 3, overflowCount: 0 });
  });

  it('第二行最后一个 tag 放不下（isLast 分支，空间不足）', () => {
    // 容器 100, overflowTag=30
    // 第一行：50(rem=50)；2+60=62 > 50 → row1End=0
    // 第二行 r2start=1：
    //   i=1(isFirst, not isLast): needed=60, 需 60+2+30=92 <= 100 ✓ → rem=40, r2count=1
    //   i=2(not isFirst, isLast): needed=2+50=52 > 40 → 不放入, break
    // visibleCount=2, overflowCount=1
    expect(calcLayout([50, 60, 50], 30, 100)).toEqual({ visibleCount: 2, overflowCount: 1 });
  });

  it('第二行第一个 tag 就放不下时一个也不放', () => {
    // 容器 60, overflowTag=30
    // 第一行：50(rem=10)；2+50=52 > 10 → row1End=0
    // 第二行 r2start=1：
    //   i=1(isFirst, not isLast): needed=50; 需 50+2+30=82 > 60 → break, r2count=0
    // visibleCount=1, overflowCount=2
    expect(calcLayout([50, 50, 50], 30, 60)).toEqual({ visibleCount: 1, overflowCount: 2 });
  });

  // ────────────────────── tag 宽度被截断 ──────────────────────

  it('tag 宽度超过容器宽度时被截断为容器宽度', () => {
    // tagWidths=[200,100], 容器 150 → widths=[150,100]
    // 第一行：150(rem=0)；2+100=102 > 0 → row1End=0
    // 第二行 r2start=1：
    //   i=1(isFirst, isLast): needed=100 <= 150 ✓ → r2count=1, break
    // visibleCount=2, overflowCount=0
    expect(calcLayout([200, 100], 30, 150)).toEqual({ visibleCount: 2, overflowCount: 0 });
  });

  it('多个 tag 均超出容器宽度时均被截断', () => {
    // 每个 tag 截断为 100，容器 100, overflowTag=30
    // 第一行：100(rem=0)；2+100=102 > 0 → row1End=0
    // 第二行 r2start=1：
    //   i=1(isFirst, not isLast): needed=100; 需 100+2+30=132 > 100 → break
    // visibleCount=1, overflowCount=2
    expect(calcLayout([200, 300, 400], 30, 100)).toEqual({ visibleCount: 1, overflowCount: 2 });
  });

  // ────────────────────── 第一行只放得下一个 tag ──────────────────────

  it('第一行恰好放一个、第二行剩余全部放下（均为最后）', () => {
    // 容器 80, overflowTag=20
    // 第一行：60(rem=20)；2+60=62 > 20 → row1End=0
    // 第二行 r2start=1：
    //   i=1(isFirst, isLast): needed=60 <= 80 ✓ → r2count=1, break
    // visibleCount=2, overflowCount=0
    expect(calcLayout([60, 60], 20, 80)).toEqual({ visibleCount: 2, overflowCount: 0 });
  });

  // ────────────────────── overflowTagWidth 影响 ──────────────────────

  it('overflowTagWidth 较大时第二行能放入的 tag 更少', () => {
    // 容器 200, overflowTag=100
    // 第一行：60(rem=140)；2+60=62(rem=78)；2+60=62 > 78? 78>=62 ✓(rem=16)；2+60=62 > 16 → row1End=2
    // row1End=2 !== 4 → 进入第二行
    // 第二行 r2start=3：
    //   i=3(isFirst, not isLast): needed=60; 需 60+2+100=162 <= 200 ✓ → rem=140, r2count=1
    //   i=4(not isFirst, isLast): needed=2+60=62 <= 140 ✓ → r2count=2, break
    // visibleCount=5, overflowCount=0
    expect(calcLayout([60, 60, 60, 60, 60], 100, 200)).toEqual({ visibleCount: 5, overflowCount: 0 });
  });

  it('overflowTagWidth 较大导致第二行无法放入任何 tag', () => {
    // 容器 80, overflowTag=80
    // 第一行：40(rem=40)；2+40=42 > 40 → row1End=0
    // 第二行 r2start=1：
    //   i=1(isFirst, not isLast): needed=40; 需 40+2+80=122 > 80 → break
    // visibleCount=1, overflowCount=2
    expect(calcLayout([40, 40, 40], 80, 80)).toEqual({ visibleCount: 1, overflowCount: 2 });
  });
});
