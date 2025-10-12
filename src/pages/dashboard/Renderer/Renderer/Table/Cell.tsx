import React from 'react';
import _ from 'lodash';
import { Popover, Tooltip } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import replaceTemplateVariables from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import { IPanel } from '../../../types';

interface Props {
  text: string;
  color?: string;
  style?: React.CSSProperties;
  panel: IPanel;
  record: any;
}

export default function Cell(props: Props) {
  const { text, color, style, panel, record } = props;
  const { custom } = panel;
  const { links, linkMode, nowrap = false } = custom;
  const firstLink = _.first<any>(links);
  const styleObj = style || { color };
  if (!record) return null;
  const data = {
    name: record.name,
    value: record.value,
    metric: record.metric,
  };

  return (
    <Tooltip placement='topLeft' title={nowrap ? text : undefined}>
      <div
        className='renderer-table-td-content'
        style={{
          ...styleObj,
          whiteSpace: nowrap ? 'nowrap' : undefined,
          overflow: nowrap ? 'hidden' : undefined,
          textOverflow: nowrap ? 'ellipsis' : undefined,
        }}
      >
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
                          <a
                            target={link.targetBlank ? '_blank' : '_self'}
                            href={replaceTemplateVariables(link.url, {
                              scopedVars: data,
                            })}
                          >
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
              <a
                target={firstLink?.targetBlank ? '_blank' : '_self'}
                href={replaceTemplateVariables(firstLink?.url, {
                  scopedVars: data,
                })}
                style={styleObj}
              >
                {text}
              </a>
            )}
          </>
        ) : (
          text
        )}
      </div>
    </Tooltip>
  );
}
