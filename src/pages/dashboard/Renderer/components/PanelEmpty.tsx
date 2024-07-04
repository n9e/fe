import React, { useRef, useEffect } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import { useSize } from 'ahooks';
import { IPanel } from '../../types';
import { getMaxFontSize } from '../utils/getTextWidth';

interface Props {
  values: IPanel;
  bodyWrapRef: {
    current: HTMLDivElement | null;
  };
}

export default function PanelEmpty(props: Props) {
  const { values, bodyWrapRef } = props;
  const ele = useRef(null);
  const eleSize = useSize(ele);
  // colorMode 只是为了兼容 stat 图时的无数据也可以显示背景色模式
  let colorMode = 'value';
  if (values.type === 'stat' && _.get(values, 'custom.colorMode') === 'background') {
    colorMode = 'background';
  }
  const valueMappings = _.get(values, 'options.valueMappings');
  const finded = _.find(valueMappings, (item) => {
    return item.type === 'specialValue' && item.match?.specialValue === 'null';
  });

  // 为了兼容 stat 图时的无数据也可以显示背景色模式
  useEffect(() => {
    if (bodyWrapRef.current && finded?.result?.color) {
      if (colorMode === 'background') {
        const color = finded.result?.color;
        const colorObject = d3.color(color);
        bodyWrapRef.current.style.border = `1px solid ${colorObject + ''}`;
        bodyWrapRef.current.style.backgroundColor = colorObject + '';
        bodyWrapRef.current.style.color = '#fff';
      } else {
        bodyWrapRef.current.style.border = `0 none`;
        bodyWrapRef.current.style.backgroundColor = 'unset';
        bodyWrapRef.current.style.color = 'unset';
      }
    }
  }, [colorMode, finded?.result?.color]);

  if (finded) {
    // 值映射匹配到无数据时，会根据 stat 图的样式来渲染映射的文本
    const fontSize = getMaxFontSize(finded.result?.text, (eleSize?.width! - 20) * 0.8, (eleSize?.height! / 2 / 3) * 2);
    return (
      <div style={{ padding: 10, width: '100%', height: '100%' }}>
        <div
          ref={ele}
          className='renderer-body-content-empty'
          style={{
            color: colorMode === 'background' ? '#fff' : finded.result?.color,
            fontSize: fontSize,
          }}
        >
          {finded.result?.text}
        </div>
      </div>
    );
  }

  return <div className='renderer-body-content-empty'>No Data</div>;
}
