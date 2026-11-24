import { getHighlightHtml, getHighlightPartsByRanges, getTokenHighlights } from '@/pages/logExplorer/utils/highlight/highlight_html';
import { highlightTags } from '@/pages/logExplorer/utils/highlight/highlight_tags';

import resolveNestedHighlightRanges from './resolveNestedHighlightRanges';

const taggedMatch = 'a' + highlightTags.pre + 'md6' + highlightTags.post + '4';
const highlights = { 'attr.host.arh': [taggedMatch] };
const host = '{"arh":"amd64","backup_arh":"amd64"}';

function renderParts(field: string, text: string, fieldHighlights = highlights) {
  const ranges = resolveNestedHighlightRanges(field, text, fieldHighlights) ?? [];
  const parts = getHighlightPartsByRanges(text, undefined, ranges);
  expect(parts.map((part) => part.text).join('')).toBe(text);
  return parts.map(({ text, highlighted }) => (highlighted ? '<mark>' + text + '</mark>' : text)).join('');
}

it('at flatten depth 0 highlights the exact leaf within the top-level JSON text', () => {
  const text = '{\r\n  "host":' + host + '\r\n}';
  expect(renderParts('attr', text)).toBe('{\r\n  "host":{"arh":"a<mark>md6</mark>4","backup_arh":"amd64"}\r\n}');
});

it('at flatten depth 1 only highlights the matching child of the displayed object', () => {
  expect(renderParts('attr.host', host)).toBe('{"arh":"a<mark>md6</mark>4","backup_arh":"amd64"}');
});

it('at flatten depth 2 keeps direct scalar highlighting', () => {
  const value = 'amd64';
  expect(resolveNestedHighlightRanges('attr.host.arh', value, highlights)).toBeUndefined();
  expect(getHighlightHtml(value, getTokenHighlights(value, highlights['attr.host.arh'], 0, value.length))).toBe('a<mark>md6</mark>4');
});

it('translates decoded offsets to the displayed JSON without changing escape sequences', () => {
  const text = '{"arh":"a\\u006d\\u006464","backup_arh":"amd64"}';
  expect(renderParts('attr.host', text)).toBe('{"arh":"a<mark>\\u006d\\u00646</mark>4","backup_arh":"amd64"}');
});

it('matches case-insensitively and prefers a literal dotted key', () => {
  const text = '{"host.ARH":"amd64","host":{"arh":"amd64"}}';
  expect(renderParts('ATTR', text)).toBe('{"host.ARH":"a<mark>md6</mark>4","host":{"arh":"amd64"}}');
});

it('uses the surrounding fragment to disambiguate matches within the same value', () => {
  const text = '{"arh":"unused amd64 use this amd64 suffix"}';
  const context = 'use this ' + taggedMatch + ' suffix';
  expect(renderParts('attr.host', text, { 'attr.host.arh': [context] })).toBe('{"arh":"unused amd64 use this a<mark>md6</mark>4 suffix"}');
  expect(renderParts('attr.host', text)).toBe(text);
});

it('ignores missing paths, sibling prefixes and malformed JSON', () => {
  expect(renderParts('attr.host', '{"backup_arh":"amd64"}')).toBe('{"backup_arh":"amd64"}');
  expect(renderParts('attr.hos', host)).toBe(host);
  expect(renderParts('attr.host', '{arh:"amd64"}')).toBe('{arh:"amd64"}');
});

it('combines direct field highlights with nested ranges and merges overlaps', () => {
  const text = 'abcdef';
  const direct = [highlightTags.pre + 'cde' + highlightTags.post];
  expect(getHighlightPartsByRanges(text, direct, [{ from: 1, to: 3 }])).toEqual([
    { text: 'a', highlighted: false },
    { text: 'bcde', highlighted: true },
    { text: 'f', highlighted: false },
  ]);
});
