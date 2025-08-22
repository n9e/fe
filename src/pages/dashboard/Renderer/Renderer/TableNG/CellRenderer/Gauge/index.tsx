import React, { useContext, useRef } from 'react';
import { useSize } from 'ahooks';

import { CommonStateContext } from '@/App';
import { IOptions, CellOptions } from '@/pages/dashboard/types';

import calcMaxFieldTextWidth from '../../utils/calcMaxFieldTextWidth';

import { TextObject } from '../types';
import BasicBar from './BasicBar';
import LCDBar from './LCDBar';

import './style.less';

interface Props {
  formattedData: { [key: string]: TextObject }[];
  field: string;
  valueDomain: [number, number];
  data: TextObject;
  cellOptions: CellOptions;
  options: IOptions;
  rangeMode?: 'lcro' | 'lcrc';
}

export default function Gauge(props: Props) {
  const { formattedData, field } = props;
  const containerRef = useRef(null);
  const containerSize = useSize(containerRef);
  const maxFieldTextWidth = calcMaxFieldTextWidth(field, formattedData);

  return (
    <div ref={containerRef} className='h-[27px]'>
      {containerSize?.width ? <Main width={containerSize.width} maxFieldTextWidth={maxFieldTextWidth} {...props} /> : null}
    </div>
  );
}

function Main(props: { width: number; maxFieldTextWidth: number } & Props) {
  const { darkMode } = useContext(CommonStateContext);
  const { width, maxFieldTextWidth, valueDomain, data, cellOptions, options, rangeMode } = props;
  const { mode, valueDisplayMode } = cellOptions;

  if (mode === 'basic') {
    return (
      <BasicBar
        maxFieldTextWidth={maxFieldTextWidth}
        item={data}
        valueMode={valueDisplayMode}
        themeMode={darkMode ? 'dark' : undefined}
        minValue={valueDomain[0]}
        maxValue={valueDomain[1]}
      />
    );
  } else if (mode === 'lcd') {
    return (
      <LCDBar
        maxBarWidth={width}
        maxFieldTextWidth={maxFieldTextWidth}
        item={data}
        valueMode={valueDisplayMode}
        options={options}
        minValue={valueDomain[0]}
        maxValue={valueDomain[1]}
        rangeMode={rangeMode}
      />
    );
  }
  return null;
}
