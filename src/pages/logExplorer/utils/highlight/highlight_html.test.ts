/// <reference types="jest" />

import { getMatchedHighlightFragments, getTokenHighlights, getHighlightHtml } from './highlight_html';
import { highlightTags } from './highlight_tags';
import { htmlTags } from './html_tags';

describe('highlight_html helpers', () => {
  it('highlights the full token when the highlighted content contains the token', () => {
    const fieldValue = 'abcdef';
    const highlights = [`${highlightTags.pre}abcdef${highlightTags.post}`];

    expect(getTokenHighlights(fieldValue, highlights, 0, fieldValue.length)).toEqual([`${highlightTags.pre}abcdef${highlightTags.post}`]);
  });

  it('highlights each matched token after tokenization', () => {
    const fieldValue = 'abc-def';
    const highlights = [`${highlightTags.pre}abc${highlightTags.post}-${highlightTags.pre}def${highlightTags.post}`];

    expect(getTokenHighlights(fieldValue, highlights, 0, 3)).toEqual([`${highlightTags.pre}abc${highlightTags.post}`]);
    expect(getTokenHighlights(fieldValue, highlights, 4, 7)).toEqual([`${highlightTags.pre}def${highlightTags.post}`]);
  });

  it('does not highlight a token that is not contained in highlighted content', () => {
    const fieldValue = 'foo bar';
    const highlights = [`${highlightTags.pre}foo${highlightTags.post} bar`];

    expect(getTokenHighlights(fieldValue, highlights, 4, 7)).toBeUndefined();
  });

  it('supports non-string field values without throwing', () => {
    const fieldValue = 12345;
    const highlights = [`${highlightTags.pre}12345${highlightTags.post}`];

    expect(getTokenHighlights(fieldValue, highlights, 0, 5)).toEqual([`${highlightTags.pre}12345${highlightTags.post}`]);
  });

  it('highlights partial matches inside a full line when surrounding context matches', () => {
    const fieldValue = '"description": "数据库连接池耗尽 (Connection pool exhausted)！当前活跃连接 500/500，等待队列长度 1024+"';
    const highlights = [
      `e\": \"dev-doris-001\",\n\t"${highlightTags.pre}数据库连接池耗尽${highlightTags.post} (Connection pool exhausted)！当前活跃${highlightTags.pre}连接${highlightTags.post} 500/500，等待队列长度 1024+`,
    ];

    expect(getTokenHighlights(fieldValue, highlights, 0, fieldValue.length)).toEqual([
      `${highlightTags.pre}数据库连接池耗尽${highlightTags.post}`,
      `${highlightTags.pre}连接${highlightTags.post}`,
    ]);
  });

  it('highlights repeated tokens as long as the token text is contained in highlighted content', () => {
    const fieldValue = 'foo foo';
    const highlights = [`${highlightTags.pre}foo${highlightTags.post} foo`];

    expect(getTokenHighlights(fieldValue, highlights, 0, 3)).toEqual([`${highlightTags.pre}foo${highlightTags.post}`]);
    expect(getTokenHighlights(fieldValue, highlights, 4, 7)).toEqual([`${highlightTags.pre}foo${highlightTags.post}`]);
  });

  it('extracts primitive highlights from content-level highlight snippets', () => {
    const contentHighlights = [`"http_host": "${highlightTags.pre}flashcatcloud.com${highlightTags.post}"`, `"status": "${highlightTags.pre}301${highlightTags.post}"`];

    expect(getMatchedHighlightFragments('flashcatcloud.com', contentHighlights)).toEqual([`${highlightTags.pre}flashcatcloud.com${highlightTags.post}`]);
    expect(getMatchedHighlightFragments(301, contentHighlights)).toEqual([`${highlightTags.pre}301${highlightTags.post}`]);
  });

  it('does not highlight a primitive when only part of its value is highlighted', () => {
    const contentHighlights = [`"status": "${highlightTags.pre}301${highlightTags.post}"`];

    expect(getMatchedHighlightFragments('3010', contentHighlights)).toBeUndefined();
    expect(getMatchedHighlightFragments(3010, contentHighlights)).toBeUndefined();
  });

  describe('object field values (nested structures)', () => {
    it('getTokenHighlights stringifies object fieldValue without throwing', () => {
      const obj = { key: 'value', num: 42 };
      const serialized = JSON.stringify(obj);
      const highlights = [`${highlightTags.pre}value${highlightTags.post}`];

      expect(() => getTokenHighlights(obj, highlights, 0, serialized.length)).not.toThrow();
    });

    it('getTokenHighlights returns undefined for objects with no matching highlight', () => {
      const obj = { foo: 'bar' };
      const serialized = JSON.stringify(obj);
      const highlights = [`${highlightTags.pre}nonexistent${highlightTags.post}`];

      expect(getTokenHighlights(obj, highlights, 0, serialized.length)).toBeUndefined();
    });

    it('getTokenHighlights matches highlight inside stringified object', () => {
      const obj = { status: 'error', code: 500 };
      const serialized = JSON.stringify(obj);
      // 'error' appears in the serialized string {"status":"error","code":500}
      const highlights = [`${highlightTags.pre}error${highlightTags.post}`];

      const result = getTokenHighlights(obj, highlights, 0, serialized.length);
      expect(result).toBeDefined();
      expect(result).toContain(`${highlightTags.pre}error${highlightTags.post}`);
    });

    it('getHighlightHtml stringifies object and escapes HTML safely', () => {
      const obj = { x: '<script>alert(1)</script>' };
      const result = getHighlightHtml(obj, undefined);

      expect(result).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(result).not.toContain('<script>');
    });

    it('getHighlightHtml wraps highlighted fragments with html tags for objects', () => {
      const obj = { msg: 'hello' };
      const highlights = [`${highlightTags.pre}hello${highlightTags.post}`];
      const result = getHighlightHtml(obj, highlights);

      expect(result).toContain(`${htmlTags.pre}hello${htmlTags.post}`);
    });

    it('getMatchedHighlightFragments returns undefined for no matching highlight in object', () => {
      const obj = { id: 123, name: 'test' };
      const highlights = [`${highlightTags.pre}nonexistent${highlightTags.post}`];

      expect(getMatchedHighlightFragments(obj, highlights)).toBeUndefined();
    });

    it('getMatchedHighlightFragments does not throw with object fieldValue', () => {
      const obj = { id: 123, name: 'test' };

      expect(() => getMatchedHighlightFragments(obj, undefined)).not.toThrow();
      expect(() => getMatchedHighlightFragments(obj, [])).not.toThrow();
    });

    it('getMatchedHighlightFragments returns undefined for empty object', () => {
      const highlights = [`${highlightTags.pre}anything${highlightTags.post}`];

      expect(getMatchedHighlightFragments({}, highlights)).toBeUndefined();
    });

    it('getTokenHighlights handles nested array fieldValue', () => {
      const arr = [1, [2, 3], { a: 'b' }];
      const serialized = JSON.stringify(arr);

      expect(() => getTokenHighlights(arr, undefined, 0, serialized.length)).not.toThrow();
    });
  });
});
