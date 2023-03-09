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

import React, { useEffect, useState, useRef } from 'react';
import cx from 'classnames';
import _get from 'lodash/get';
import { useTraceTimeline } from './index';
import { TraceSpan } from '../../type';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import spanAncestorIds from '../../utils/span-ancestor-ids';
import './SpanTreeOffset.css';

type TProps = {
  childrenVisible?: boolean;
  onClick?: () => void;
  span: TraceSpan;
  showChildrenIcon?: boolean;
};

export default function SpanTreeOffset(props: TProps) {
  const [traceTimeLine, setTraceTimeLine] = useTraceTimeline();
  const [ancestorIds, setAncestorIds] = useState<string[]>([]);

  const hoverIndentGuideIdsRef = useRef<Set<string>>(traceTimeLine.hoverIndentGuideIds);

  useEffect(() => {
    let ancestorIds: string[];

    ancestorIds = spanAncestorIds(props.span);
    // Some traces have multiple root-level spans, this connects them all under one guideline and adds the
    // necessary padding for the collapse icon on root-level spans.
    ancestorIds.push('root');

    ancestorIds.reverse();
    setAncestorIds(ancestorIds);
  }, []);

  function addHoverIndentGuideId(spanID) {
    const newHoverIndentGuideIds = new Set(hoverIndentGuideIdsRef.current);
    newHoverIndentGuideIds.add(spanID);
    hoverIndentGuideIdsRef.current = newHoverIndentGuideIds;
    setTraceTimeLine((traceTimeLine) => ({ ...traceTimeLine, hoverIndentGuideIds: newHoverIndentGuideIds }));
  }

  function removeHoverIndentGuideId(spanID) {
    const newHoverIndentGuideIds = new Set(hoverIndentGuideIdsRef.current);
    newHoverIndentGuideIds.delete(spanID);
    hoverIndentGuideIdsRef.current = newHoverIndentGuideIds;
    setTraceTimeLine((traceTimeLine) => ({ ...traceTimeLine, hoverIndentGuideIds: newHoverIndentGuideIds }));
  }

  /**
   * If the mouse leaves to anywhere except another span with the same ancestor id, this span's ancestor id is
   * removed from the set of hoverIndentGuideIds.
   *
   * @param {Object} event - React Synthetic event tied to mouseleave. Includes the related target which is
   *     the element the user is now hovering.
   * @param {string} ancestorId - The span id that the user was hovering over.
   */
  const handleMouseLeave = (event: React.MouseEvent<HTMLSpanElement>, ancestorId: string) => {
    if (!(event.relatedTarget instanceof HTMLSpanElement) || _get(event, 'relatedTarget.dataset.ancestorId') !== ancestorId) {
      removeHoverIndentGuideId(ancestorId);
    }
  };

  /**
   * If the mouse entered this span from anywhere except another span with the same ancestor id, this span's
   * ancestorId is added to the set of hoverIndentGuideIds.
   *
   * @param {Object} event - React Synthetic event tied to mouseenter. Includes the related target which is
   *     the last element the user was hovering.
   * @param {string} ancestorId - The span id that the user is now hovering over.
   */
  const handleMouseEnter = (event: React.MouseEvent<HTMLSpanElement>, ancestorId: string) => {
    if (!(event.relatedTarget instanceof HTMLSpanElement) || _get(event, 'relatedTarget.dataset.ancestorId') !== ancestorId) {
      addHoverIndentGuideId(ancestorId);
    }
  };

  const { childrenVisible, onClick, showChildrenIcon = true, span } = props;
  const { hasChildren, spanID } = span;
  const wrapperProps = hasChildren ? { onClick, role: 'switch', 'aria-checked': childrenVisible } : null;
  const icon = showChildrenIcon && hasChildren && (childrenVisible ? <DownOutlined /> : <RightOutlined />);
  return (
    <span className={`SpanTreeOffset ${hasChildren ? 'is-parent' : ''}`} {...wrapperProps}>
      {ancestorIds.map((ancestorId) => (
        <span
          key={ancestorId}
          className={cx('SpanTreeOffset--indentGuide', {
            'is-active': traceTimeLine.hoverIndentGuideIds.has(ancestorId),
          })}
          data-ancestor-id={ancestorId}
          onMouseEnter={(event) => handleMouseEnter(event, ancestorId)}
          onMouseLeave={(event) => handleMouseLeave(event, ancestorId)}
        />
      ))}
      {icon && (
        <span className='SpanTreeOffset--iconWrapper' onMouseEnter={(event) => handleMouseEnter(event, spanID)} onMouseLeave={(event) => handleMouseLeave(event, spanID)}>
          {icon}
        </span>
      )}
    </span>
  );
}
