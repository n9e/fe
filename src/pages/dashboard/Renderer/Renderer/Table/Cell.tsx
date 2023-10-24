import React from 'react';
import _ from 'lodash';
import { Popover } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { IPanel } from '../../../types';

interface Props {
  text: string;
  color?: string;
  style?: React.CSSProperties;
  panel: IPanel;
}

export default function Cell(props: Props) {
  const { text, color, style, panel } = props;
  const { custom } = panel;
  const { links, linkMode } = custom;
  const firstLink = _.first<any>(links);
  const styleObj = style || { color };

  return (
    <div className='renderer-table-td-content' style={styleObj}>
      {linkMode === 'cellLink' && !_.isEmpty(links) ? (
        <>
          {_.size(links) > 1 ? (
            <Popover
              placement='bottomLeft'
              trigger={['click']}
              content={
                <div>
                  {_.map(links, (link, idx) => {
                    return (
                      <div key={idx}>
                        <a target={link.targetBlank ? '_blank' : '_self'} href={link.url}>
                          <LinkOutlined /> {link.title}
                        </a>
                      </div>
                    );
                  })}
                </div>
              }
            >
              <a style={styleObj}>{text}</a>
            </Popover>
          ) : (
            <a target={firstLink?.targetBlank ? '_blank' : '_self'} href={firstLink?.url} style={styleObj}>
              {text}
            </a>
          )}
        </>
      ) : (
        text
      )}
    </div>
  );
}
