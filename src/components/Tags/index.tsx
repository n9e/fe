import React from 'react';
import _ from 'lodash';
import { Tag, Tooltip } from 'antd';
import { getTextWidth } from '@/pages/dashboard/Renderer/Renderer/Hexbin/utils';

interface Props {
  width: number;
  data: string[];
  color?: string;
}

export default function index(props: Props) {
  const { width, data, color = 'purple' } = props;
  const displayData = _.slice(data, 0, 2);
  return (
    <Tooltip title={_.join(data, ', ')}>
      <div>
        {_.map(displayData, (item, index) => {
          const textWidth = getTextWidth(item);
          if (textWidth < width) {
            return (
              <div key={index}>
                <Tag color={color}>{item}</Tag>
              </div>
            );
          }
          return (
            <div key={index}>
              <Tag color={color}>
                <div
                  style={{
                    maxWidth: width,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      verticalAlign: 'middle',
                      display: 'inline-block',
                      width: 'calc(50% + 1.2em)',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item}
                  </span>
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      verticalAlign: 'middle',
                      display: 'inline-flex',
                      width: 'calc(50% - 1.2em)',
                      justifyContent: ' flex-end',
                    }}
                  >
                    {item}
                  </span>
                </div>
              </Tag>
            </div>
          );
        })}
        {data.length > 2 && (
          <div
            style={{
              lineHeight: 1,
            }}
          >
            ...
          </div>
        )}
      </div>
    </Tooltip>
  );
}
