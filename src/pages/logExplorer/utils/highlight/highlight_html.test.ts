/// <reference types="jest" />

import { getMatchedHighlightFragments, getTokenHighlights } from './highlight_html';
import { highlightTags } from './highlight_tags';

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
});
