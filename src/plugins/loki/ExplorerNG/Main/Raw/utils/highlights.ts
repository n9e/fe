import _ from 'lodash';

import { highlightTags } from '@/pages/logExplorer/utils/highlight/highlight_tags';

import { LokiLineFilter, LokiLogRow, LokiRawBuilderState } from '../../../types';

export interface LineHighlightFilter {
  op: '|=' | '|~';
  value: string;
}

function trimFilterValue(value?: string | number) {
  return _.trim(_.toString(value ?? ''));
}

function toPositiveLineFilter(item?: Partial<LokiLineFilter>): LineHighlightFilter | null {
  const value = trimFilterValue(item?.value);
  if (!value || (item?.op !== '|=' && item?.op !== '|~')) return null;
  return {
    op: item.op,
    value,
  };
}

function readQuotedValue(input: string, start: number) {
  const quote = input[start];
  let value = '';
  let escaped = false;
  for (let index = start + 1; index < input.length; index += 1) {
    const char = input[index];
    if (escaped) {
      value += char;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === quote) {
      return {
        value,
        end: index + 1,
      };
    }
    value += char;
  }
  return {
    value,
    end: input.length,
  };
}

function readLineFilterValue(input: string, start: number) {
  let index = start;
  while (index < input.length && /\s/.test(input[index])) index += 1;
  if (input[index] === '"' || input[index] === "'" || input[index] === '`') {
    return readQuotedValue(input, index);
  }
  const end = _.findIndex(input.slice(index).split(''), (char) => /\s|\|/.test(char));
  if (end === -1) {
    return {
      value: input.slice(index),
      end: input.length,
    };
  }
  return {
    value: input.slice(index, index + end),
    end: index + end,
  };
}

export function extractLineHighlightFiltersFromQuery(query?: string): LineHighlightFilter[] {
  const input = _.toString(query || '');
  const filters: LineHighlightFilter[] = [];
  const pattern = /\|(=|~)/g;
  let match = pattern.exec(input);
  while (match) {
    const value = readLineFilterValue(input, match.index + match[0].length);
    const filter = toPositiveLineFilter({
      op: match[0] as '|=' | '|~',
      value: value.value,
    });
    if (filter) filters.push(filter);
    pattern.lastIndex = value.end;
    match = pattern.exec(input);
  }
  return filters;
}

export function getLineHighlightFilters(queryValues?: Record<string, any>) {
  const builder = queryValues?.builder?.raw as LokiRawBuilderState | undefined;
  if (queryValues?.querySource === 'builder' && queryValues?.builderStatus === 'synced' && builder) {
    return _.compact(_.map(builder.lineFilters || [], toPositiveLineFilter));
  }
  return extractLineHighlightFiltersFromQuery(queryValues?.query);
}

function tagHighlight(value: string) {
  return `${highlightTags.pre}${value}${highlightTags.post}`;
}

function getRegexMatches(line: string, pattern: string) {
  try {
    const regex = new RegExp(pattern, 'g');
    const matches: string[] = [];
    let match = regex.exec(line);
    while (match) {
      if (match[0]) {
        matches.push(match[0]);
      }
      regex.lastIndex = match.index + Math.max(match[0].length, 1);
      match = regex.exec(line);
    }
    return matches;
  } catch (e) {
    return [];
  }
}

export function getLineHighlights(line: string, filters: LineHighlightFilter[]) {
  const values = _.flatMap(filters, (filter) => {
    if (filter.op === '|=') return line.includes(filter.value) ? [filter.value] : [];
    return getRegexMatches(line, filter.value);
  });
  return _.map(_.uniq(_.filter(values)), tagHighlight);
}

export function buildLogHighlights(logs: Partial<LokiLogRow>[], filters: LineHighlightFilter[]): { [key: string]: string[] }[] | undefined {
  if (_.isEmpty(filters)) return undefined;
  return _.map(logs, (log) => {
    const lineHighlights = getLineHighlights(log.line || '', filters);
    return _.isEmpty(lineHighlights) ? ({} as { [key: string]: string[] }) : { line: lineHighlights };
  });
}
