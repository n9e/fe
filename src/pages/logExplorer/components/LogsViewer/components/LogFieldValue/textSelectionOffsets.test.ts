/** @jest-environment jsdom */

import { getFieldSelectionOffsets, getSelectionRangeWithinRoot } from './textSelect';

function renderField(...parts: (Node | string)[]): HTMLSpanElement {
  const root = document.createElement('span');
  root.append(...parts);
  document.body.append(root);
  return root;
}

function select(start: Node, startOffset: number, end: Node, endOffset: number): Selection {
  const range = document.createRange();
  range.setStart(start, startOffset);
  range.setEnd(end, endOffset);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

afterEach(() => {
  window.getSelection()?.removeAllRanges();
  document.body.replaceChildren();
});

it('trims leading and trailing whitespace across highlighted text nodes', () => {
  const prefix = document.createTextNode('{\r\n  "arh":"🧪 arm64",\r\n  "backupArh":"  ');
  const mark = document.createElement('mark');
  mark.textContent = 'arm';
  const suffix = document.createTextNode('64  "\r\n}');
  const root = renderField(prefix, mark, suffix);
  const value = '{\r\n  "arh":"🧪 arm64",\r\n  "backupArh":"  arm64  "\r\n}';
  const selection = select(prefix, prefix.length - 2, suffix, 4);
  const clipped = getSelectionRangeWithinRoot(selection, root)!;

  expect(clipped.toString()).toBe('  arm64  ');
  const from = value.lastIndexOf('arm64');
  expect(getFieldSelectionOffsets(root, clipped, value, selection.toString())).toEqual({ from, to: from + 'arm64'.length });
});

it('clips a full selection with endpoints in the surrounding wrapper', () => {
  const value = ' \r\n{"arh":"arm64"}\r\n ';
  const root = renderField(value);
  const wrapper = renderField('\t', root, '\n');
  const selection = select(wrapper, 0, wrapper, wrapper.childNodes.length);
  const clipped = getSelectionRangeWithinRoot(selection, root)!;

  expect(clipped.toString()).toBe(value);
  expect(selection.toString()).toBe(`\t${value}\n`);
  expect(getFieldSelectionOffsets(root, clipped, value, selection.toString())).toEqual({ from: 3, to: value.length - 3 });
});

it('maps a range spanning multiple child fields to a single substring of the source', () => {
  const firstField = document.createTextNode('{"arh":"one');
  const secondField = document.createTextNode('","backupArh":"two"}');
  const root = renderField(firstField, secondField);
  const value = '{"arh":"one","backupArh":"two"}';
  const selection = select(firstField, firstField.data.indexOf('one'), secondField, secondField.data.indexOf('two') + 'two'.length);
  const clipped = getSelectionRangeWithinRoot(selection, root)!;

  expect(clipped.toString()).toBe('one","backupArh":"two');
  expect(getFieldSelectionOffsets(root, clipped, value, selection.toString())).toEqual({ from: value.indexOf('one'), to: value.indexOf('two') + 'two'.length });
});

it('rejects field offsets when the selection also contains text outside the field', () => {
  const root = renderField('arm64');
  const wrapper = renderField('attr.host: ', root);
  const selection = select(wrapper, 0, root, root.childNodes.length);
  const clipped = getSelectionRangeWithinRoot(selection, root)!;

  expect(clipped.toString()).toBe('arm64');
  expect(getFieldSelectionOffsets(root, clipped, 'arm64', selection.toString())).toBeUndefined();
});

it('rejects field offsets when formatting changed the displayed value', () => {
  const root = renderField('arm64');
  const selection = select(root, 0, root, root.childNodes.length);
  const clipped = getSelectionRangeWithinRoot(selection, root)!;

  expect(getFieldSelectionOffsets(root, clipped, 'arch: arm64', selection.toString())).toBeUndefined();
});
