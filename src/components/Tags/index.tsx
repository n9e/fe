import React from 'react';
import _ from 'lodash';
import { Tag, Tooltip } from 'antd';

interface Props {
  width: number;
  data: string[];
}

export default function index(props: Props) {
  const { width, data } = props;
  const displayData = _.slice(data, 0, 2);
  return (
    <Tooltip title={_.join(data, ', ')}>
      <div>
        {_.map(displayData, (item, index) => {
          return (
            <div key={index}>
              <Tag color='purple'>
                <div
                  style={{
                    maxWidth: width,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item}
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
