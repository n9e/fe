import React from 'react';
import _ from 'lodash';
import { Tag, Tooltip } from 'antd';
import { Link } from 'react-router-dom';

interface Props {
  data: { id: number; name: string }[];
  tagLinkTo: (item) => {
    pathname: string;
    search: string;
  };
}

export default function index(props: Props) {
  const { data, tagLinkTo } = props;
  const displayData = _.slice(data, 0, 3);
  return (
    <Tooltip title={_.join(_.map(data, 'name'), ', ')}>
      <div>
        {_.map(displayData, (item) => {
          return (
            <Link key={item.id} to={tagLinkTo(item)}>
              <Tag color='purple' style={{ maxWidth: '100%', marginRight: 8 }}>
                <div
                  style={{
                    maxWidth: 'max-content',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.name}
                </div>
              </Tag>
            </Link>
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
