import { getTokenLinks } from './tokenLinks';
import type { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';

const trace = 'e8e8bfbb2e4de0958f440232f8c4a86b';
const span = '0123456789abcdef';
const apm = { field: 'content', name: 'APM', urlTemplate: '/apm/trace?traceId=$trace_id' };
const config: FieldConfigVersion2 = {
  version: 2,
  arr: [],
  linkArr: [apm],
  regExtractArr: [{ field: 'content', newField: 'trace_id', reg: '\\[(?:trace_id=)?([a-f0-9]{32})(?=\\s*(?:,|/|]))' }],
};

it.each([`[trace_id=${trace}, span_id=${span}]`, `[${trace}/${span}]`, `[${trace}]`])('links only the extracted value for %s', (content) => {
  const raw = { content: `2026-10-21 INFO Logger ${content} request done` };
  expect(getTokenLinks('content', trace, true, raw, config)).toEqual([apm]);
  for (const token of ['2026-10-21', 'INFO', 'Logger', 'request', 'trace_id', span, 'done']) {
    expect(getTokenLinks('content', token, true, raw, config)).toEqual([]);
  }
});
it('supports braced references without matching variable-name prefixes', () => {
  const raw = { content: `[${trace}]` };
  const braced = { ...apm, urlTemplate: '/trace?id=${trace_id}' };
  expect(getTokenLinks('content', 'INFO', true, raw, { ...config, linkArr: [braced] })).toEqual([]);
  const other = { ...apm, urlTemplate: '/trace?id=$trace_id_other' };
  expect(getTokenLinks('content', 'INFO', true, raw, { ...config, linkArr: [other] })).toEqual([other]);
});
it('keeps ordinary links and whole-field/table behavior', () => {
  const ordinary = { ...apm, name: 'Search', urlTemplate: '/search?q=$content' };
  const mixed = { ...config, linkArr: [apm, ordinary] };
  const raw = { content: `[${trace}] INFO` };
  expect(getTokenLinks('content', 'INFO', true, raw, mixed)).toEqual([ordinary]);
  expect(getTokenLinks('content', raw.content, false, raw, mixed)).toEqual([apm, ordinary]);
  expect(getTokenLinks('other', trace, true, raw, mixed)).toEqual([]);
});
it('does not expose an extracted link when extraction fails or is invalid', () => {
  expect(getTokenLinks('content', 'INFO', true, { content: 'INFO []' }, config)).toEqual([]);
  expect(getTokenLinks('content', trace, true, undefined, config)).toEqual([]);
  expect(getTokenLinks('content', trace, true, { content: trace }, { ...config, regExtractArr: [{ ...config.regExtractArr![0], reg: '(' }] })).toEqual([]);
});
it('handles nested fields and literal dotted field names as URL generation does', () => {
  const nested = { ...config, linkArr: [{ ...apm, field: 'log.content' }], regExtractArr: [{ ...config.regExtractArr![0], field: 'log.content' }] };
  expect(getTokenLinks('log.content', trace, true, { log: { content: `[${trace}]` } }, nested)).toHaveLength(1);
  expect(getTokenLinks('log.content', trace, true, { 'log.content': `[${trace}]` }, nested)).toHaveLength(1);
});
