/// <reference types="jest" />

import {
  filterContentPrimitiveHighlightsByDirectHighlights,
  getContentPrimitiveHighlights,
  getHighlightRanges,
  getMatchedHighlightFragments,
  getTokenHighlights,
} from './highlight_html';
import { highlightTags } from './highlight_tags';

describe('highlight_html helpers', () => {
  it('returns partial token highlight when only part of token is matched', () => {
    const fieldValue = 'abcdef';
    const highlights = [`abc${highlightTags.pre}def${highlightTags.post}`];

    expect(getTokenHighlights(fieldValue, highlights, 0, fieldValue.length)).toEqual([`abc${highlightTags.pre}def${highlightTags.post}`]);
  });

  it('splits cross-delimiter matches into each token intersection', () => {
    const fieldValue = 'abc-def';
    const highlights = [`${highlightTags.pre}abc${highlightTags.post}-${highlightTags.pre}def${highlightTags.post}`];

    expect(getTokenHighlights(fieldValue, highlights, 0, 3)).toEqual([`${highlightTags.pre}abc${highlightTags.post}`]);
    expect(getTokenHighlights(fieldValue, highlights, 4, 7)).toEqual([`${highlightTags.pre}def${highlightTags.post}`]);
  });

  it('keeps highlight ranges anchored to the matched fragment order', () => {
    const fieldValue = 'foo foo';
    const highlights = [`${highlightTags.pre}foo${highlightTags.post} foo`];

    expect(getHighlightRanges(fieldValue, highlights)).toEqual([
      {
        start: 0,
        end: 3,
      },
    ]);
    expect(getTokenHighlights(fieldValue, highlights, 4, 7)).toBeUndefined();
  });

  it('supports non-string field values without throwing', () => {
    const fieldValue = 12345;
    const highlights = [`12${highlightTags.pre}345${highlightTags.post}`];

    expect(getTokenHighlights(fieldValue, highlights, 0, 5)).toEqual([`12${highlightTags.pre}345${highlightTags.post}`]);
  });

  it('extracts primitive highlights from content-level highlight snippets', () => {
    const contentHighlights = [`"http_host": "${highlightTags.pre}flashcatcloud.com${highlightTags.post}"`, `"status": "${highlightTags.pre}301${highlightTags.post}"`];

    expect(getMatchedHighlightFragments('flashcatcloud.com', contentHighlights)).toEqual([`${highlightTags.pre}flashcatcloud.com${highlightTags.post}`]);
    expect(getMatchedHighlightFragments(301, contentHighlights)).toEqual([`${highlightTags.pre}301${highlightTags.post}`]);
  });

  it('maps content highlights to the precise primitive path by raw content position', () => {
    const rawContent = `{
  "request": {
    "status": 301,
    "http_host": "flashcatcloud.com"
  },
  "status": "301"
}`;
    const contentHighlights = [`"status": "${highlightTags.pre}301${highlightTags.post}"`];

    expect(getContentPrimitiveHighlights(rawContent, JSON.parse(rawContent), contentHighlights, 'content')).toEqual({
      'content.status': [`${highlightTags.pre}301${highlightTags.post}`],
    });
  });

  it('maps snippet-based content highlights to the exact nested primitive path', () => {
    const rawContent = `
{
	"request":{
		"request_time": 2.989,
		"http_host": "flashcatcloud.com",
		"request_uri": "/bfsprd/sysIntroduction?orderID=94",
		"status": 301
	},
	"remote_addr": "116.178.232.3",
	"request_time": "2.989",
	"method": "GET",
	"scheme": "https",
	"http_host": "flashcatcloud.com",
	"request_uri": "/bfsprd/sysIntroduction?orderID=94",
	"status": "301"
  }
`;
    const contentHighlights = [
      `\t\t"request_time": 2.989,\n\t\t"http_host": "${highlightTags.pre}flashcatcloud.com${highlightTags.post}",\n\t\t"request_uri": "/bfsprd/sysIntroduction?orderID=94",\n\t\t"status": ${highlightTags.pre}301${highlightTags.post}\n\t},\n\t"remote_addr": "116.178.232.3",\n\t"request_`,
      `GET",\n\t"scheme": "https",\n\t"http_host": "${highlightTags.pre}flashcatcloud.com${highlightTags.post}",\n\t"request_uri": "/bfsprd/sysIntroduction?orderID=94",\n\t"status": "${highlightTags.pre}301${highlightTags.post}"\n  }\n`,
    ];

    expect(getContentPrimitiveHighlights(rawContent, JSON.parse(rawContent), contentHighlights, 'content')).toEqual({
      'content.request.http_host': [`${highlightTags.pre}flashcatcloud.com${highlightTags.post}`],
      'content.request.status': [`${highlightTags.pre}301${highlightTags.post}`],
      'content.http_host': [`${highlightTags.pre}flashcatcloud.com${highlightTags.post}`],
      'content.status': [`${highlightTags.pre}301${highlightTags.post}`],
    });
  });

  it('drops conflicting content highlights when the direct field is already highlighted', () => {
    const contentPrimitiveHighlights = {
      'content.request.http_host': [`${highlightTags.pre}flashcatcloud.com${highlightTags.post}`],
      'content.request.status': [`${highlightTags.pre}301${highlightTags.post}`],
      'content.http_host': [`${highlightTags.pre}flashcatcloud.com${highlightTags.post}`],
      'content.status': [`${highlightTags.pre}301${highlightTags.post}`],
    };
    const highlights = {
      content: [`"http_host": "${highlightTags.pre}flashcatcloud.com${highlightTags.post}"`, `"status": "${highlightTags.pre}301${highlightTags.post}"`],
      status: [`${highlightTags.pre}301${highlightTags.post}`],
    };

    expect(filterContentPrimitiveHighlightsByDirectHighlights(contentPrimitiveHighlights, highlights, 'content')).toEqual({
      'content.request.http_host': [`${highlightTags.pre}flashcatcloud.com${highlightTags.post}`],
      'content.http_host': [`${highlightTags.pre}flashcatcloud.com${highlightTags.post}`],
    });
  });

  it('keeps non-scalar content highlights even when a direct field highlight uses the same fragment', () => {
    const contentPrimitiveHighlights = {
      'content.request.http_host': [`${highlightTags.pre}flashcatcloud.com${highlightTags.post}`],
      'content.http_host': [`${highlightTags.pre}flashcatcloud.com${highlightTags.post}`],
    };
    const highlights = {
      content: [`"http_host": "${highlightTags.pre}flashcatcloud.com${highlightTags.post}"`],
      http_host: [`${highlightTags.pre}flashcatcloud.com${highlightTags.post}`],
    };

    expect(filterContentPrimitiveHighlightsByDirectHighlights(contentPrimitiveHighlights, highlights, 'content')).toEqual(contentPrimitiveHighlights);
  });
});
