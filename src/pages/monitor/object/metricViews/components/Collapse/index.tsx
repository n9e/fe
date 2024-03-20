import React, { useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Resizable } from 're-resizable';
import _ from 'lodash';
import './style.less';
import { Tooltip } from 'antd';

interface Props {
  children: React.ReactNode;
  collapseLocalStorageKey: string;
  widthLocalStorageKey: string;
  defaultWidth: number;
  minWidth?: number;
  tooltip?: string;
}

export default function index(props: Props) {
  const { children, collapseLocalStorageKey, widthLocalStorageKey, defaultWidth, minWidth = 200, tooltip } = props;
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem(widthLocalStorageKey) || defaultWidth));
  const [collapse, setCollapse] = useState(localStorage.getItem(collapseLocalStorageKey) === '1');
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <Resizable
      style={{
        marginRight: collapse ? 2 : 10,
        marginLeft: collapse ? 10 : 0,
      }}
      size={{ width: collapse ? 0 : width, height: '100%' }}
      enable={{
        right: collapse ? false : true,
      }}
      onResizeStop={(e, direction, ref, d) => {
        let curWidth = width + d.width;
        if (curWidth < minWidth) {
          curWidth = minWidth;
        }
        setWidth(curWidth);
        localStorage.setItem(widthLocalStorageKey, curWidth.toString());
      }}
    >
      <div className={collapse ? 'n9e-sidebar-collapse' : ''} style={{ height: '100%' }}>
        <Tooltip
          title={tooltip}
          visible={tooltipVisible}
          onVisibleChange={(visible) => {
            setTooltipVisible(visible);
          }}
        >
          <div
            className='n9e-sidebar-collapse-btn'
            onClick={() => {
              localStorage.setItem(collapseLocalStorageKey, !collapse ? '1' : '0');
              setCollapse(!collapse);
              setTooltipVisible(false);
            }}
          >
            {!collapse ? <LeftOutlined /> : <RightOutlined />}
          </div>
        </Tooltip>
        <div className='n9e-sidebar-collapse-content' style={{ height: '100%' }}>
          {children}
        </div>
      </div>
    </Resizable>
  );
}
