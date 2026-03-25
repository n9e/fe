import _ from 'lodash';
import { highlightTags } from './highlight_tags';
import { htmlTags } from './html_tags';

interface HighlightPart {
  text: string;
  highlighted: boolean;
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

function getHighlightFragmentsContainingText(candidateText: string, highlights: string[] | undefined | null): string[] {
  if (!candidateText) {
    return [];
  }

  return getHighlightFragments(highlights).filter((fragment) => {
    const fragmentText = stripHighlightTags(fragment);
    return !!fragmentText && fragmentText.includes(candidateText);
  });
}

export function getMatchedHighlightFragments(fieldValue: string | number | boolean | object | null | undefined, highlights: string[] | undefined | null): string[] | undefined {
  const fieldText = getFieldText(fieldValue);
  if (!fieldText) {
    return undefined;
  }

  const matchedFragments = getHighlightFragmentsContainingText(fieldText, highlights);

  return matchedFragments.length > 0 ? matchedFragments : undefined;
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

  const matchedTokenHighlights = getHighlightFragmentsContainingText(tokenText, highlights);

  if (matchedTokenHighlights.length === 0) {
    return undefined;
  }

  return [`${highlightTags.pre}${tokenText}${highlightTags.post}`];
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
