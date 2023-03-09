// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { TraceSpan } from '../../../type';

/**
 * Returns `true` if the `span` has a tag matching `key` = `value`.
 *
 * @param  {string} key   The tag key to match on.
 * @param  {any}    value The tag value to match.
 * @param  {{tags}} span  An object with a `tags` property of { key, value }
 *                        items.
 * @returns {boolean}      True if a match was found.
 */
export function spanHasTag(key: string, value: any, span: TraceSpan) {
  if (!Array.isArray(span.tags) || !span.tags.length) {
    return false;
  }
  return span.tags.some((tag) => tag.key === key && tag.value === value);
}

export const isClientSpan = spanHasTag.bind(null, 'span.kind', 'client');
export const isServerSpan = spanHasTag.bind(null, 'span.kind', 'server');

const isErrorBool = spanHasTag.bind(null, 'error', true);
const isErrorStr = spanHasTag.bind(null, 'error', 'true');
export const isErrorSpan = (span: TraceSpan) => isErrorBool(span) || isErrorStr(span);

/**
 * Returns `true` if at least one of the descendants of the `parentSpanIndex`
 * span contains an error tag.
 *
 * @param      {TraceSpan[]}   spans            The spans for a trace - should be
 *                                         sorted with children following parents.
 * @param      {number}   parentSpanIndex  The index of the parent span - only
 *                                         subsequent spans with depth less than
 *                                         the parent span will be checked.
 * @returns     {boolean}  Returns `true` if a descendant contains an error tag.
 */
export function spanContainsErredSpan(spans: TraceSpan[], parentSpanIndex: number) {
  const { depth } = spans[parentSpanIndex];
  let i = parentSpanIndex + 1;
  for (; i < spans.length && spans[i].depth > depth; i++) {
    if (isErrorSpan(spans[i])) {
      return true;
    }
  }
  return false;
}
