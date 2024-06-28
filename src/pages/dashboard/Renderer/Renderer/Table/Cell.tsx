import React from 'react';
import _ from 'lodash';
import { Popover, Tooltip } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { IPanel } from '../../../types';
import { getDetailUrl } from '../../utils/replaceExpressionDetail';
import { useGlobalState } from '../../../globalState';

interface Props {
  text: string;
  color?: string;
  style?: React.CSSProperties;
  panel: IPanel;
  time: IRawTimeRange;
  record: any;
}

export default function Cell(props: Props) {
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const { text, color, style, panel, time, record } = props;
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
                          <a target={link.targetBlank ? '_blank' : '_self'} href={getDetailUrl(link.url, data, dashboardMeta, time)}>
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
              <a target={firstLink?.targetBlank ? '_blank' : '_self'} href={getDetailUrl(firstLink?.url, data, dashboardMeta, time)} style={styleObj}>
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
