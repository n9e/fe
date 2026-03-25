import _ from 'lodash';
import { highlightTags } from './highlight_tags';
import { htmlTags } from './html_tags';

interface HighlightPart {
  text: string;
  highlighted: boolean;
}

interface HighlightRange {
  start: number;
  end: number;
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

interface JsonObject {
  [key: string]: JsonValue;
}

type JsonArray = JsonValue[];

interface PrimitiveLocation {
  path: string;
  displayValue: string;
  displayStart: number;
  displayEnd: number;
}

function getFieldText(fieldValue: string | number | boolean | object | null | undefined) {
  if (fieldValue === null || fieldValue === undefined) {
    return '';
  }

  return typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue);
}

function parseHighlightParts(highlight: string): HighlightPart[] {
  const parts: HighlightPart[] = [];
  let cursor = 0;

  while (cursor < highlight.length) {
    const highlightStart = highlight.indexOf(highlightTags.pre, cursor);

    if (highlightStart === -1) {
      const plainText = highlight.slice(cursor);
      if (plainText) {
        parts.push({
          text: plainText,
          highlighted: false,
        });
      }
      break;
    }

    if (highlightStart > cursor) {
      parts.push({
        text: highlight.slice(cursor, highlightStart),
        highlighted: false,
      });
    }

    const taggedTextStart = highlightStart + highlightTags.pre.length;
    const highlightEnd = highlight.indexOf(highlightTags.post, taggedTextStart);

    if (highlightEnd === -1) {
      const fallbackText = highlight.slice(highlightStart);
      if (fallbackText) {
        parts.push({
          text: fallbackText,
          highlighted: false,
        });
      }
      break;
    }

    const highlightedText = highlight.slice(taggedTextStart, highlightEnd);
    if (highlightedText) {
      parts.push({
        text: highlightedText,
        highlighted: true,
      });
    }

    cursor = highlightEnd + highlightTags.post.length;
  }

  return parts;
}

export function getHighlightFragments(highlights: string[] | undefined | null): string[] {
  if (!highlights || highlights.length === 0) {
    return [];
  }

  return Array.from(
    new Set(
      highlights.flatMap((highlight) => {
        return parseHighlightParts(highlight)
          .filter((part) => part.highlighted && part.text)
          .map((part) => `${highlightTags.pre}${part.text}${highlightTags.post}`);
      }),
    ),
  );
}

function stripHighlightTags(text: string) {
  return text.split(highlightTags.pre).join('').split(highlightTags.post).join('');
}

function isScalarHighlightFragment(fragmentText: string) {
  return /^(?:-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)$/.test(fragmentText);
}

export function getMatchedHighlightFragments(fieldValue: string | number | boolean | object | null | undefined, highlights: string[] | undefined | null): string[] | undefined {
  const fieldText = getFieldText(fieldValue);
  if (!fieldText) {
    return undefined;
  }

  const matchedFragments = getHighlightFragments(highlights).filter((fragment) => {
    const fragmentText = stripHighlightTags(fragment);
    return !!fragmentText && fieldText.includes(fragmentText);
  });

  return matchedFragments.length > 0 ? matchedFragments : undefined;
}

function isJsonObject(value: JsonValue): value is JsonObject {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function isJsonArray(value: JsonValue): value is JsonArray {
  return Array.isArray(value);
}

function isJsonPrimitive(value: JsonValue): value is JsonPrimitive {
  return !isJsonObject(value) && !isJsonArray(value);
}

function getContentFieldPath(path: string[], fieldPrefix = 'content') {
  return [fieldPrefix, path.join('.')].filter(Boolean).join('.') || fieldPrefix;
}

function getNextNonWhitespaceIndex(text: string, start: number) {
  let cursor = start;
  while (cursor < text.length && /\s/.test(text[cursor])) {
    cursor += 1;
  }
  return cursor;
}

function getPrimitiveLocation(text: string, start: number, path: string[], value: JsonPrimitive, fieldPrefix = 'content'): PrimitiveLocation | null {
  const tokenStart = getNextNonWhitespaceIndex(text, start);

  if (value === null) {
    const token = 'null';
    if (!text.startsWith(token, tokenStart)) {
      return null;
    }
    return {
      path: getContentFieldPath(path, fieldPrefix),
      displayValue: token,
      displayStart: tokenStart,
      displayEnd: tokenStart + token.length,
    };
  }

  if (typeof value === 'boolean') {
    const token = String(value);
    if (!text.startsWith(token, tokenStart)) {
      return null;
    }
    return {
      path: getContentFieldPath(path, fieldPrefix),
      displayValue: token,
      displayStart: tokenStart,
      displayEnd: tokenStart + token.length,
    };
  }

  if (typeof value === 'number') {
    const numberToken = text.slice(tokenStart).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/)?.[0];
    if (!numberToken || Number(numberToken) !== value) {
      return null;
    }
    return {
      path: getContentFieldPath(path, fieldPrefix),
      displayValue: numberToken,
      displayStart: tokenStart,
      displayEnd: tokenStart + numberToken.length,
    };
  }

  const serializedString = JSON.stringify(value);
  if (!text.startsWith(serializedString, tokenStart)) {
    return null;
  }

  return {
    path: getContentFieldPath(path, fieldPrefix),
    displayValue: value,
    displayStart: tokenStart + 1,
    displayEnd: tokenStart + serializedString.length - 1,
  };
}

function collectPrimitiveLocations(text: string, value: JsonValue, fieldPrefix = 'content', path: string[] = [], start = 0): PrimitiveLocation[] {
  if (isJsonPrimitive(value)) {
    const location = getPrimitiveLocation(text, start, path, value, fieldPrefix);
    return location ? [location] : [];
  }

  if (isJsonArray(value)) {
    let cursor = getNextNonWhitespaceIndex(text, start);
    if (text[cursor] === '[') {
      cursor += 1;
    }

    return value.flatMap((item) => {
      const itemLocations = collectPrimitiveLocations(text, item, fieldPrefix, path, cursor);
      const lastLocation = itemLocations[itemLocations.length - 1];
      cursor = lastLocation ? lastLocation.displayEnd : cursor;
      return itemLocations;
    });
  }

  let cursor = getNextNonWhitespaceIndex(text, start);
  if (text[cursor] === '{') {
    cursor += 1;
  }

  return Object.entries(value).flatMap(([key, childValue]) => {
    const keyToken = JSON.stringify(key);
    const keyIndex = text.indexOf(keyToken, cursor);
    if (keyIndex === -1) {
      return [];
    }

    const colonIndex = text.indexOf(':', keyIndex + keyToken.length);
    if (colonIndex === -1) {
      return [];
    }

    const locations = collectPrimitiveLocations(text, childValue, fieldPrefix, [...path, key], colonIndex + 1);
    const lastLocation = locations[locations.length - 1];
    cursor = lastLocation ? lastLocation.displayEnd : colonIndex + 1;
    return locations;
  });
}

function buildTaggedHighlight(displayValue: string, ranges: HighlightRange[]) {
  let taggedText = '';
  let cursor = 0;

  ranges.forEach((range) => {
    if (range.start > cursor) {
      taggedText += displayValue.slice(cursor, range.start);
    }
    taggedText += `${highlightTags.pre}${displayValue.slice(range.start, range.end)}${highlightTags.post}`;
    cursor = range.end;
  });

  if (cursor < displayValue.length) {
    taggedText += displayValue.slice(cursor);
  }

  return taggedText;
}

export function getContentPrimitiveHighlights(
  rawContent: string | undefined,
  parsedContent: JsonValue,
  highlights: string[] | undefined | null,
  fieldPrefix = 'content',
): Record<string, string[]> {
  if (!rawContent || !highlights || highlights.length === 0) {
    return {};
  }

  const highlightRanges = getHighlightRanges(rawContent, highlights);
  if (highlightRanges.length === 0) {
    return {};
  }

  return collectPrimitiveLocations(rawContent, parsedContent, fieldPrefix).reduce<Record<string, string[]>>((acc, location) => {
    const intersections = highlightRanges
      .map((range) => ({
        start: Math.max(range.start, location.displayStart),
        end: Math.min(range.end, location.displayEnd),
      }))
      .filter((range) => range.end > range.start)
      .map((range) => ({
        start: range.start - location.displayStart,
        end: range.end - location.displayStart,
      }));

    if (intersections.length === 0) {
      return acc;
    }

    const taggedHighlight = buildTaggedHighlight(location.displayValue, intersections);
    if (!acc[location.path]) {
      acc[location.path] = [taggedHighlight];
      return acc;
    }

    if (!acc[location.path].includes(taggedHighlight)) {
      acc[location.path].push(taggedHighlight);
    }

    return acc;
  }, {});
}

function getContentHighlightConflictCandidates(contentPath: string, fieldPrefix = 'content'): string[] {
  if (contentPath === fieldPrefix) {
    return [];
  }

  const relativePath = contentPath.startsWith(`${fieldPrefix}.`) ? contentPath.slice(fieldPrefix.length + 1) : contentPath;
  if (!relativePath) {
    return [];
  }

  const pathParts = relativePath.split('.').filter(Boolean);

  return pathParts.map((_, index) => pathParts.slice(index).join('.')).filter(Boolean);
}

export function filterContentPrimitiveHighlightsByDirectHighlights(
  contentPrimitiveHighlights: Record<string, string[]>,
  highlights: Record<string, string[]> | undefined,
  fieldPrefix = 'content',
): Record<string, string[]> {
  if (Object.keys(contentPrimitiveHighlights).length === 0 || !highlights) {
    return contentPrimitiveHighlights;
  }

  const directHighlightFragments = Object.keys(highlights).reduce<Record<string, string[]>>((acc, key) => {
    if (!key || key === fieldPrefix || key.startsWith(`${fieldPrefix}.`) || !highlights[key]?.length) {
      return acc;
    }

    acc[key] = getHighlightFragments(highlights[key]).map(stripHighlightTags).filter(Boolean);
    return acc;
  }, {});

  const directHighlightKeys = new Set(
    Object.keys(directHighlightFragments).filter((key) => {
      if (!key || key === fieldPrefix || key.startsWith(`${fieldPrefix}.`)) {
        return false;
      }

      return directHighlightFragments[key]?.length > 0;
    }),
  );

  if (directHighlightKeys.size === 0) {
    return contentPrimitiveHighlights;
  }

  return Object.entries(contentPrimitiveHighlights).reduce<Record<string, string[]>>((acc, [contentPath, value]) => {
    const conflictCandidates = getContentHighlightConflictCandidates(contentPath, fieldPrefix);
    const contentFragments = getHighlightFragments(value).map(stripHighlightTags).filter(Boolean);
    const hasOnlyScalarFragments = contentFragments.length > 0 && contentFragments.every(isScalarHighlightFragment);
    const hasDirectHighlightConflict =
      hasOnlyScalarFragments &&
      conflictCandidates.some((candidate) => directHighlightKeys.has(candidate) && contentFragments.some((fragment) => directHighlightFragments[candidate]?.includes(fragment)));

    if (!hasDirectHighlightConflict) {
      acc[contentPath] = value;
    }

    return acc;
  }, {});
}

function mergeHighlightRanges(ranges: HighlightRange[]) {
  if (ranges.length === 0) {
    return [];
  }

  const sortedRanges = [...ranges].sort((left, right) => {
    if (left.start !== right.start) {
      return left.start - right.start;
    }
    return left.end - right.end;
  });

  return sortedRanges.reduce<HighlightRange[]>((acc, range) => {
    const lastRange = acc[acc.length - 1];

    if (!lastRange || range.start > lastRange.end) {
      acc.push({ ...range });
      return acc;
    }

    lastRange.end = Math.max(lastRange.end, range.end);
    return acc;
  }, []);
}

export function getHighlightRanges(fieldValue: string | number | boolean | object | null | undefined, highlights: string[] | undefined | null): HighlightRange[] {
  if (!highlights || highlights.length === 0) {
    return [];
  }

  const text = getFieldText(fieldValue);
  const ranges: HighlightRange[] = [];
  let searchCursor = 0;

  highlights.forEach((highlight) => {
    if (!highlight) {
      return;
    }

    const parts = parseHighlightParts(highlight);
    const plainText = parts.map((part) => part.text).join('');

    if (!plainText) {
      return;
    }

    let matchIndex = text.indexOf(plainText, searchCursor);

    if (matchIndex === -1) {
      matchIndex = text.indexOf(plainText);
    }

    if (matchIndex !== -1) {
      let offset = 0;
      parts.forEach((part) => {
        if (part.highlighted && part.text) {
          ranges.push({
            start: matchIndex + offset,
            end: matchIndex + offset + part.text.length,
          });
        }
        offset += part.text.length;
      });
      searchCursor = matchIndex + plainText.length;
      return;
    }

    let partCursor = searchCursor;
    parts.forEach((part) => {
      if (!part.highlighted || !part.text) {
        partCursor += part.text.length;
        return;
      }

      let partIndex = text.indexOf(part.text, partCursor);
      if (partIndex === -1) {
        partIndex = text.indexOf(part.text);
      }
      if (partIndex !== -1) {
        ranges.push({
          start: partIndex,
          end: partIndex + part.text.length,
        });
        partCursor = partIndex + part.text.length;
      }
    });
  });

  return mergeHighlightRanges(ranges);
}

export function getTokenHighlights(
  fieldValue: string | number | boolean | object | null | undefined,
  highlights: string[] | undefined | null,
  tokenStart: number,
  tokenEnd: number,
): string[] | undefined {
  if (!highlights || highlights.length === 0 || tokenEnd <= tokenStart) {
    return undefined;
  }

  const text = getFieldText(fieldValue);
  const tokenText = text.slice(tokenStart, tokenEnd);
  if (!tokenText) {
    return undefined;
  }

  const intersections = getHighlightRanges(fieldValue, highlights)
    .map((range) => ({
      start: Math.max(range.start, tokenStart),
      end: Math.min(range.end, tokenEnd),
    }))
    .filter((range) => range.end > range.start)
    .map((range) => ({
      start: range.start - tokenStart,
      end: range.end - tokenStart,
    }));

  if (intersections.length === 0) {
    return undefined;
  }

  let taggedToken = '';
  let cursor = 0;

  intersections.forEach((range) => {
    if (range.start > cursor) {
      taggedToken += tokenText.slice(cursor, range.start);
    }
    taggedToken += `${highlightTags.pre}${tokenText.slice(range.start, range.end)}${highlightTags.post}`;
    cursor = range.end;
  });

  if (cursor < tokenText.length) {
    taggedToken += tokenText.slice(cursor);
  }

  return [taggedToken];
}

export function getHighlightHtml(fieldValue: string | object, highlights: string[] | undefined | null) {
  let highlightHtml = typeof fieldValue === 'object' ? _.escape(JSON.stringify(fieldValue)) : _.escape(fieldValue);

  _.each(highlights, function (highlight) {
    const escapedHighlight = _.escape(highlight);

    const untaggedHighlight = escapedHighlight.split(highlightTags.pre).join('').split(highlightTags.post).join('');

    const taggedHighlight = escapedHighlight.split(highlightTags.pre).join(htmlTags.pre).split(highlightTags.post).join(htmlTags.post);

    highlightHtml = highlightHtml.split(untaggedHighlight).join(taggedHighlight);
  });

  return highlightHtml;
}
