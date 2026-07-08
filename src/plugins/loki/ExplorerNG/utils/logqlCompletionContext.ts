export type LokiCompletionContext =
  | { type: 'label_name'; from: number; to: number; selectorQuery?: string; keyword: string }
  | { type: 'label_value'; from: number; to: number; selectorQuery?: string; label: string; keyword: string }
  | { type: 'grouping_label'; from: number; to: number; selectorQuery?: string; keyword: string }
  | { type: 'static'; from: number; to: number; keyword: string }
  | { type: 'none' };

const wordPattern = /[A-Za-z0-9_:.]/;
const labelNamePattern = /^[A-Za-z_][A-Za-z0-9_:]*$/;
const matcherPattern = /([A-Za-z_][A-Za-z0-9_:]*)\s*(=~|!~|!=|=)\s*"((?:\\.|[^"\\])*)"/g;

function wordRange(doc: string, pos: number) {
  let from = pos;
  while (from > 0 && wordPattern.test(doc.charAt(from - 1))) {
    from -= 1;
  }
  let to = pos;
  while (to < doc.length && wordPattern.test(doc.charAt(to))) {
    to += 1;
  }
  return {
    from,
    to,
    keyword: doc.slice(from, pos),
  };
}

function buildSelectorQuery(selectorContent: string) {
  const matchers: string[] = [];
  matcherPattern.lastIndex = 0;
  let match = matcherPattern.exec(selectorContent);
  while (match) {
    matchers.push(match[0]);
    match = matcherPattern.exec(selectorContent);
  }
  return matchers.length > 0 ? `{${matchers.join(',')}}` : '{}';
}

function findOpenSelector(doc: string, pos: number) {
  let inQuote = false;
  let escaped = false;
  let open = -1;

  for (let i = 0; i < pos; i += 1) {
    const ch = doc.charAt(i);
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (inQuote) continue;
    if (ch === '{') {
      open = i;
    } else if (ch === '}') {
      open = -1;
    }
  }

  return open;
}

function findClosedSelector(doc: string, start: number) {
  let inQuote = false;
  let escaped = false;
  let open = -1;

  for (let i = start; i < doc.length; i += 1) {
    const ch = doc.charAt(i);
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (inQuote) continue;
    if (ch === '{') {
      open = i;
    } else if (ch === '}' && open >= 0) {
      return doc.slice(open, i + 1);
    }
  }

  return undefined;
}

function extractFirstSelector(doc: string, start: number) {
  return findClosedSelector(doc, start) || findClosedSelector(doc, 0) || '{}';
}

function getGroupingContext(doc: string, pos: number) {
  const prefix = doc.slice(0, pos);
  const match = prefix.match(/\b(?:by|without)\s*\([^)]*$/i);
  if (!match || match.index === undefined) return undefined;

  const range = wordRange(doc, pos);
  const selectorQuery = extractFirstSelector(doc, pos);
  return {
    type: 'grouping_label' as const,
    from: range.from,
    to: range.to,
    keyword: range.keyword,
    selectorQuery,
  };
}

export function getLogQLCompletionContext(doc: string, pos: number): LokiCompletionContext {
  const grouping = getGroupingContext(doc, pos);
  if (grouping) return grouping;

  const openSelector = findOpenSelector(doc, pos);
  if (openSelector >= 0) {
    const selectorBeforeCursor = doc.slice(openSelector + 1, pos);
    const valueMatch = selectorBeforeCursor.match(/([A-Za-z_][A-Za-z0-9_:]*)\s*(=~|!~|!=|=)\s*"((?:\\.|[^"\\])*)$/);
    if (valueMatch) {
      const from = pos - (valueMatch[3] || '').length;
      const beforeCurrentMatcher = selectorBeforeCursor.slice(0, valueMatch.index || 0);
      return {
        type: 'label_value',
        from,
        to: pos,
        selectorQuery: buildSelectorQuery(beforeCurrentMatcher),
        label: valueMatch[1],
        keyword: valueMatch[3] || '',
      };
    }

    const range = wordRange(doc, pos);
    const segmentStart = Math.max(selectorBeforeCursor.lastIndexOf(','), selectorBeforeCursor.lastIndexOf('{')) + 1;
    const currentSegment = selectorBeforeCursor.slice(segmentStart);
    if (!/(=~|!~|!=|=)/.test(currentSegment) && (!range.keyword || labelNamePattern.test(range.keyword))) {
      const beforeCurrentLabel = selectorBeforeCursor.slice(0, Math.max(0, range.from - openSelector - 1));
      return {
        type: 'label_name',
        from: range.from,
        to: range.to,
        selectorQuery: buildSelectorQuery(beforeCurrentLabel),
        keyword: range.keyword,
      };
    }
  }

  const range = wordRange(doc, pos);
  if (range.from !== range.to || doc.charAt(pos - 1) === '|' || doc.charAt(pos - 1) === ' ') {
    return {
      type: 'static',
      from: range.from,
      to: range.to,
      keyword: range.keyword,
    };
  }

  return { type: 'none' };
}
