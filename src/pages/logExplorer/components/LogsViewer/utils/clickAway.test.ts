/** @jest-environment jsdom */
import { shouldIgnoreLogViewerClickAway } from './clickAway';

function clickAndCapture(target: HTMLElement, beforeBubble?: () => void) {
  let ignored: boolean | undefined;
  const onDocument = (e: Event) => {
    ignored = shouldIgnoreLogViewerClickAway(e);
  };
  document.addEventListener('click', onDocument);
  target.addEventListener('click', () => beforeBubble?.());
  target.click();
  document.removeEventListener('click', onDocument);
  return ignored;
}

beforeEach(() => {
  document.body.innerHTML = '<div class="ant-modal log-explorer-ignore-click-away"><ul><li><input id="cb" /></li></ul></div><button id="out"></button>';
});

it('ignores a click inside the modal even when the clicked node is removed before the document handler runs', () => {
  const cb = document.getElementById('cb')!;
  expect(clickAndCapture(cb, () => cb.closest('li')!.remove())).toBe(true);
});

it('does not ignore a click outside', () => {
  expect(clickAndCapture(document.getElementById('out')!)).toBe(false);
});

it('ignores a click on the ignore container itself, not only its descendants', () => {
  expect(clickAndCapture(document.querySelector('.log-explorer-ignore-click-away') as HTMLElement)).toBe(true);
});

it('throws when a caller still passes an element instead of the click event (signature changed)', () => {
  const oldStyleCall = shouldIgnoreLogViewerClickAway as unknown as (target: HTMLElement | null) => boolean;

  expect(() => oldStyleCall(document.getElementById('out'))).toThrow(TypeError);
});
