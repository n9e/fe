import getTooltipPosition from './getTooltipPosition';

describe('getTooltipPosition', () => {
  const tooltip = { width: 200, height: 120 };
  const viewport = { width: 800, height: 600 };

  it.each([
    ['room on both axes', { x: 100, y: 100 }, { left: 110, top: 110 }],
    ['right edge', { x: 790, y: 100 }, { left: 580, top: 110 }],
    ['bottom edge', { x: 100, y: 590 }, { left: 110, top: 460 }],
    ['bottom right corner', { x: 790, y: 590 }, { left: 580, top: 460 }],
    ['top left corner', { x: 0, y: 0 }, { left: 12, top: 12 }],
    ['pointer outside a resized viewport', { x: 1000, y: 700 }, { left: 588, top: 468 }],
    ['exactly enough space', { x: 578, y: 458 }, { left: 588, top: 468 }],
  ])('places the tooltip within the viewport for %s', (_name, pointer, expected) => {
    expect(getTooltipPosition(pointer, tooltip, viewport)).toEqual(expected);
  });

  it('keeps a wide tooltip inside the viewport when neither side of the pointer can contain it', () => {
    expect(getTooltipPosition({ x: 400, y: 300 }, { width: 600, height: 400 }, viewport)).toEqual({ left: 12, top: 12 });
  });

  it('uses the actual measured size for long content and a narrow viewport', () => {
    expect(getTooltipPosition({ x: 270, y: 350 }, { width: 256, height: 180 }, { width: 280, height: 720 })).toEqual({ left: 12, top: 360 });
  });
});
