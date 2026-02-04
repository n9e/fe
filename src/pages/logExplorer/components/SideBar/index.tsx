import React, { useState } from 'react';
import { Resizable } from 're-resizable';
import classNames from 'classnames';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';

interface Props {
  ns: string;
  children: React.ReactNode;
}

export default function index(props: Props) {
  const { ns, children } = props;
  const sidebarCollapseCacheKey = `ng-${ns}-explorer-sidebar-collapse`;
  const sidebarWidthCacheKey = `ng-${ns}-explorer-sidebar-width`;

  const [collapse, setCollapse] = useState(_.toNumber(localStorage.getItem(sidebarCollapseCacheKey) || 0) === 1);
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem(sidebarWidthCacheKey) || 200));

  return (
    <Resizable
      className={classNames({
        'pr-2': !collapse,
      })}
      style={{
        marginRight: collapse ? 0 : 10,
      }}
      size={{ width: collapse ? 0 : width, height: '100%' }}
      enable={{
        right: collapse ? false : true,
      }}
      minWidth={collapse ? 0 : 200}
      onResizeStop={(e, direction, ref, d) => {
        const curWidth = width + d.width;
        setWidth(curWidth);
        localStorage.setItem(sidebarWidthCacheKey, curWidth.toString());
        // 触发 resize 事件，让右侧图表重新计算尺寸
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 0);
      }}
      handleClasses={{
        right: collapse ? 'cursor-default' : width <= 200 ? 'cursor-e-resize' : 'cursor-col-resize',
      }}
      handleComponent={{
        right: (
          <div className='w-full h-full relative group'>
            {!collapse && (
              <div
                className='h-full absolute left-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                style={{
                  borderLeft: '2px solid var(--fc-fill-4)',
                }}
              />
            )}
          </div>
        ),
      }}
    >
      <div
        className={classNames('flex-shrink-0 h-full', {
          'w-0': collapse,
          'p-0': collapse,
        })}
      >
        <div className='w-[10px] h-full group absolute top-0 right-[-5px]'>
          {!collapse && (
            <div
              className='h-full absolute left-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-200'
              style={{
                borderLeft: '2px solid var(--fc-fill-4)',
              }}
            />
          )}
          <div
            className={classNames(
              'z-[1] w-[10px] h-[60px] bg-fc-300 rounded-md absolute top-1/2 -translate-y-1/2 hover:bg-fc-400 hover:h-[100px] transition-all duration-200 flex items-center justify-center cursor-pointer',
              {
                'right-0': !collapse,
                'right-[7px]': collapse,
              },
            )}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              setCollapse(!collapse);
              localStorage.setItem(sidebarCollapseCacheKey, !collapse ? '1' : '0');
            }}
          >
            {!collapse ? <LeftOutlined /> : <RightOutlined />}
          </div>
        </div>
        <div
          className={classNames('h-full flex flex-col', {
            hidden: collapse,
          })}
        >
          {children}
        </div>
      </div>
    </Resizable>
  );
}
