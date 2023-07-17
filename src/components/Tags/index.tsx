import React from 'react';
import _ from 'lodash';
import { Tag, Tooltip } from 'antd';

interface Props {
  width: number;
  data: string[];
}

export default function index(props: Props) {
  const { width, data } = props;
  return (
    <>
      {_.map(data, (item, index) => {
        return (
          <Tooltip title={item}>
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
          </Tooltip>
        );
      })}
    </>
  );
}
