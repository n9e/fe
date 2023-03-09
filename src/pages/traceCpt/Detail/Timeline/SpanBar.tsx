import React from 'react';
import { Popover } from 'antd';
import _groupBy from 'lodash/groupBy';

import AccordianLogs from './SpanDetail/AccordianLogs';

import { ViewedBoundsFunctionType } from '../../utils';
import { TNil, Span } from '../../type';
import './SpanBar.css';
type TCommonProps = {
  color: string;
  hintSide: string;
  // onClick: (evt: React.MouseEvent<any>) => void;
  onClick?: (evt: React.MouseEvent<any>) => void;
  viewEnd: number;
  viewStart: number;
  shortLabel: string;
  longLabel: string;
};

type TInnerProps = {
  label: string;
  setLongLabel: () => void;
  setShortLabel: () => void;
} & TCommonProps;

function toPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default function SpanBar(props: TInnerProps) {
  const { viewEnd, viewStart, color, label, hintSide, onClick, setLongLabel, setShortLabel } = props;

  return (
    <div className='SpanBar--wrapper' onClick={onClick} onMouseOut={setShortLabel} onMouseOver={setLongLabel} aria-hidden>
      <div
        aria-label={label}
        className='SpanBar--bar'
        style={{
          background: color,
          left: toPercent(viewStart),
          width: toPercent(viewEnd - viewStart),
        }}
      >
        <div className={`SpanBar--label is-${hintSide}`}>{label}</div>
      </div>
      <div></div>
    </div>
  );
}
