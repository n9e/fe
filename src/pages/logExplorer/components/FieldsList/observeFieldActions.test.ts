/** @jest-environment jsdom */
import observeFieldActions from './observeFieldActions';

let callbacks: Map<number, FrameRequestCallback>;
let nextFrame: number;
let disposers: Array<() => void>;
let resizes: Array<() => void>;
const originalResizeObserver = global.ResizeObserver;

beforeEach(() => {
  callbacks = new Map();
  nextFrame = 0;
  disposers = [];
  resizes = [];
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callbacks.set(++nextFrame, callback);
    return nextFrame;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    callbacks.delete(id);
  });
  global.ResizeObserver = class {
    constructor(callback: () => void) {
      resizes.push(callback);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});
afterEach(() => {
  disposers.forEach((dispose) => dispose());
  document.body.innerHTML = '';
  global.ResizeObserver = originalResizeObserver;
  jest.restoreAllMocks();
});
function tick() {
  const batch = Array.from(callbacks.values());
  callbacks.clear();
  batch.forEach((callback) => callback(0));
}
function row(events: string[] = []) {
  const parent = document.createElement('div');
  const actions = document.createElement('span');
  const button = document.createElement('button');
  actions.append(button);
  parent.append(actions);
  document.body.append(parent);
  const rect = jest.spyOn(actions, 'getBoundingClientRect').mockImplementation(() => {
    events.push('read');
    return { width: 72, right: 100 } as DOMRect;
  });
  jest.spyOn(button, 'getBoundingClientRect').mockImplementation(() => {
    events.push('read');
    return { left: 52 } as DOMRect;
  });
  const set = parent.style.setProperty.bind(parent.style);
  const write = jest.spyOn(parent.style, 'setProperty').mockImplementation((name, value, priority) => {
    events.push('write');
    set(name, value, priority);
  });
  const dispose = observeFieldActions(actions);
  disposers.push(dispose);
  return { parent, actions, button, rect, write, dispose };
}

it('measures every field before the first style write and coalesces observer notifications', () => {
  const events: string[] = [];
  const rows = Array.from({ length: 232 }, () => row(events));
  rows.forEach(({ button }) => button.setAttribute('aria-pressed', 'true'));
  resizes.forEach((resize) => {
    resize();
    resize();
  });
  expect(callbacks.size).toBe(1);
  expect(events).toEqual([]);
  tick();
  expect(events.slice(0, 464)).toEqual(Array(464).fill('read'));
  expect(events.slice(464)).toEqual(Array(464).fill('write'));
  expect(rows[0].parent.style.getPropertyValue('--log-field-active-width')).toBe('56px');
  rows.forEach(({ write }) => write.mockClear());
  resizes.forEach((resize) => resize());
  tick();
  rows.forEach(({ write }) => expect(write).not.toHaveBeenCalled());
});

it('updates reserved space on pressed state, child and hidden-to-visible size changes', async () => {
  const item = row();
  item.rect.mockReturnValue({ width: 0, right: 0 } as DOMRect);
  tick();
  item.rect.mockReturnValue({ width: 72, right: 100 } as DOMRect);
  resizes[0]();
  item.button.setAttribute('aria-pressed', 'true');
  await Promise.resolve();
  tick();
  expect(item.parent.style.getPropertyValue('--log-field-actions-width')).toBe('80px');
  expect(item.parent.style.getPropertyValue('--log-field-active-width')).toBe('56px');
  item.button.remove();
  await Promise.resolve();
  tick();
  expect(item.parent.style.getPropertyValue('--log-field-active-width')).toBe('0px');
});

it('drops unmounted rows and cancels the last pending frame', () => {
  const removed = row();
  const retained = row();
  removed.dispose();
  tick();
  expect(removed.rect).not.toHaveBeenCalled();
  expect(retained.rect).toHaveBeenCalledTimes(1);
  resizes[1]();
  retained.dispose();
  resizes[1]();
  expect(callbacks.size).toBe(0);
});

it('still handles pressed state changes without ResizeObserver', async () => {
  global.ResizeObserver = undefined as unknown as typeof ResizeObserver;
  const item = row();
  tick();
  item.button.setAttribute('aria-pressed', 'true');
  await Promise.resolve();
  tick();
  expect(item.parent.style.getPropertyValue('--log-field-active-width')).toBe('56px');
});
