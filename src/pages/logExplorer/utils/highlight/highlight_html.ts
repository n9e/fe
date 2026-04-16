import _ from 'lodash';
import { highlightTags } from './highlight_tags';
import { htmlTags } from './html_tags';

interface HighlightPart {
  text: string;
  highlighted: boolean;
}

interface HighlightSegment {
  text: string;
  beforeText: string;
  afterText: string;
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

function getHighlightSegments(highlights: string[] | undefined | null): HighlightSegment[] {
  if (!highlights || highlights.length === 0) {
    return [];
  }

  return highlights.flatMap((highlight) => {
    const parts = parseHighlightParts(highlight);

    return parts.flatMap((part, index) => {
      if (!part.highlighted || !part.text) {
        return [];
      }

      const previousPart = parts[index - 1];
      const nextPart = parts[index + 1];

      return {
        text: part.text,
        beforeText: previousPart && !previousPart.highlighted ? previousPart.text : '',
        afterText: nextPart && !nextPart.highlighted ? nextPart.text : '',
      };
    });
  });
}

function getContextSuffix(text: string, size = 24) {
  return text.slice(Math.max(0, text.length - size));
}

function getContextPrefix(text: string, size = 24) {
  return text.slice(0, size);
}

function isContextCompatible(candidateContext: string, highlightContext: string, position: 'before' | 'after') {
  if (!highlightContext || !candidateContext) {
    return true;
  }

  if (position === 'before') {
    return candidateContext.endsWith(highlightContext) || highlightContext.endsWith(candidateContext);
  }

  return candidateContext.startsWith(highlightContext) || highlightContext.startsWith(candidateContext);
}

function hasContextualMatch(candidateText: string, segment: HighlightSegment) {
  let searchStart = 0;

  while (searchStart <= candidateText.length) {
    const matchIndex = candidateText.indexOf(segment.text, searchStart);

    if (matchIndex === -1) {
      return false;
    }

    const beforeContext = getContextSuffix(segment.beforeText);
    const afterContext = getContextPrefix(segment.afterText);
    const beforeCandidate = candidateText.slice(0, matchIndex);
    const afterCandidate = candidateText.slice(matchIndex + segment.text.length);
    const beforeMatched = isContextCompatible(beforeCandidate, beforeContext, 'before');
    const afterMatched = isContextCompatible(afterCandidate, afterContext, 'after');

    if (beforeMatched || afterMatched) {
      return true;
    }

    searchStart = matchIndex + segment.text.length;
  }

  return false;
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

  const exactFragments = getHighlightFragments(highlights).filter((fragment) => stripHighlightTags(fragment) === tokenText);
  if (exactFragments.length > 0) {
    return exactFragments;
  }

  const matchedTokenHighlights = getHighlightFragmentsContainingText(tokenText, highlights);

  if (matchedTokenHighlights.length === 0) {
    const contextualHighlights = Array.from(
      new Set(
        getHighlightSegments(highlights)
          .filter((segment) => tokenText.includes(segment.text) && hasContextualMatch(tokenText, segment))
          .map((segment) => `${highlightTags.pre}${segment.text}${highlightTags.post}`),
      ),
    );

    return contextualHighlights.length > 0 ? contextualHighlights : undefined;
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
