/** @jest-environment jsdom */
import { getExternalLogScroll, isExternalLogAtBottom } from './scrollParent';
import { getIsAtBottom, scrollToTop } from '@/plugins/doris/ExplorerNG/utils/tableElementMethods';

beforeEach(() => {
  document.body.innerHTML = '<div id="page" style="overflow-y:auto"><div data-log-results><div class="grid"></div></div></div>';
});

it('uses the page instead of the grid to detect the end of results and reset a query', () => {
  const page = document.getElementById('page')!;
  const results = document.querySelector<HTMLElement>('[data-log-results]')!;
  const grid = document.querySelector('.grid')!;
  let bottom = 900;
  jest.spyOn(page, 'getBoundingClientRect').mockImplementation(() => ({ top: 50 } as DOMRect));
  jest.spyOn(results, 'getBoundingClientRect').mockImplementation(() => ({ bottom } as DOMRect));
  jest.spyOn(results, 'getClientRects').mockImplementation(() => ({ length: 1 } as DOMRectList));
  Object.defineProperty(page, 'clientHeight', { value: 600 });
  page.scrollTo = jest.fn();
  expect(getExternalLogScroll(grid)?.parent).toBe(page);
  expect(getIsAtBottom('.grid', '.absent')).toBe(false);
  bottom = 650;
  expect(getIsAtBottom('.grid', '.absent')).toBe(true);
  scrollToTop('.grid', '.absent');
  expect(page.scrollTo).toHaveBeenCalledWith({ top: 0 });
});

it('does not load additional results for a hidden retained tab', () => {
  expect(isExternalLogAtBottom(document.querySelector('.grid'))).toBe(false);
});

it('keeps the legacy grid behavior for callers outside the external scroll layout', () => {
  document.querySelector('[data-log-results]')!.removeAttribute('data-log-results');
  expect(isExternalLogAtBottom(document.querySelector('.grid'))).toBeUndefined();
  expect(getIsAtBottom('.grid', '.absent')).toBe(true);
});
