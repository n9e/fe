import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Color from 'color';
import uPlot from 'uplot';
import { message, Popover, Space, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { deleteAnnotations } from '@/services/dashboardV2';

import EditButton from './EditButton';

import './style.less';

const DEFAULT_ANNOTATION_COLOR = 'rgba(0, 211, 255, 1)';
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

interface MarkersProps {
  annotations: any[];
  uplotRef: React.MutableRefObject<uPlot>;
  onEdit: () => void;
  onDelete: () => void;
}

function Marker({ annotation, content, onEdit, onDelete }) {
  const { t } = useTranslation('dashboard');
  const { time_start, time_end, description, tags } = annotation;
  const [popoverVisible, setPopoverVisible] = React.useState(false);

  return (
    <Popover
      trigger={['hover']}
      visible={popoverVisible}
      onVisibleChange={(visible) => {
        setPopoverVisible(visible);
      }}
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {time_start !== time_end ? (
            <span>
              {moment.unix(time_start).format(TIME_FORMAT)} - {moment.unix(time_end).format(TIME_FORMAT)}
            </span>
          ) : (
            <span>{moment.unix(time_start).format(TIME_FORMAT)}</span>
          )}
          <Space>
            <EditButton
              initialValues={annotation}
              onOk={() => {
                message.success(t('annotation.updated'));
                onEdit();
              }}
              onClick={() => {
                setPopoverVisible(false);
              }}
            />
            <DeleteOutlined
              onClick={() => {
                setPopoverVisible(false);
                deleteAnnotations(annotation.id).then(() => {
                  message.success(t('annotation.deleted'));
                  onDelete();
                });
              }}
            />
          </Space>
        </div>
      }
      content={
        <div>
          <div>{description}</div>
          <div className='mt1'>
            {_.map(tags, (item, idx) => {
              return (
                <Tag color='green' key={item + idx}>
                  {item}
                </Tag>
              );
            })}
          </div>
        </div>
      }
      placement='bottom'
    >
      {content}
    </Popover>
  );
}

export function Markers(props: MarkersProps) {
  const { annotations, uplotRef, onEdit, onDelete } = props;
  const uplot = uplotRef.current;

  return (
    <>
      {_.map(annotations, (annotation) => {
        const { time_start, time_end } = annotation;
        const axes = uplot.root.querySelectorAll('.u-axis') as NodeListOf<HTMLDivElement>;
        const yAxisEle = axes[1];
        if (yAxisEle) {
          const yAxisEleWidth = yAxisEle.getBoundingClientRect().width;
          const x0 = uplot.valToPos(time_start, 'x', true) / uPlot.pxRatio - yAxisEleWidth;
          const x1 = uplot.valToPos(time_end, 'x', true) / uPlot.pxRatio - yAxisEleWidth;
          let content;
          if (time_start !== time_end) {
            if (x0 < uplot.rect.width && x1 > 0) {
              content = (
                <div
                  className='n9e-dashboard-annotation-range-marker'
                  style={{
                    left: x0,
                    width: x1 - x0,
                    background: DEFAULT_ANNOTATION_COLOR,
                  }}
                />
              );
            }
          } else {
            if (x0 >= 0 && x0 <= uplot.rect.width) {
              content = (
                <div
                  className='n9e-dashboard-annotation-single-marker'
                  style={{
                    left: x0,
                    borderBottomColor: DEFAULT_ANNOTATION_COLOR,
                  }}
                />
              );
            }
          }
          return <Marker annotation={annotation} content={content} onEdit={onEdit} onDelete={onDelete} />;
        }
      })}
    </>
  );
}

export default function annotationsPlugin(options: { annotations: any[]; renderMarkers: (xAxisEle: HTMLDivElement) => void }) {
  const { annotations, renderMarkers } = options;

  return {
    hooks: {
      draw: (u: uPlot) => {
        const ctx = u.ctx;

        ctx.save();
        ctx.beginPath();
        ctx.rect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height);
        ctx.clip();

        _.forEach(annotations, (annotation) => {
          const { time_start, time_end } = annotation;

          if (time_start !== time_end) {
            const x0 = u.valToPos(time_start, 'x', true);
            const x1 = u.valToPos(time_end, 'x', true);
            const y0 = u.bbox.top;
            const y1 = y0 + u.bbox.height;
            ctx.fillStyle = Color(DEFAULT_ANNOTATION_COLOR).alpha(0.1).rgb().string();
            ctx.fillRect(x0, y0, x1 - x0, y1 - y0);

            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);

            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0, y1);
            ctx.moveTo(x1, y0);
            ctx.lineTo(x1, y1);
            ctx.strokeStyle = DEFAULT_ANNOTATION_COLOR;
            ctx.stroke();
          } else {
            const x0 = u.valToPos(time_start, 'x', true);
            const y0 = u.bbox.top;
            const y1 = y0 + u.bbox.height;

            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);

            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0, y1);
            ctx.strokeStyle = DEFAULT_ANNOTATION_COLOR;
            ctx.stroke();
          }
        });

        ctx.restore();

        const xAxisEle = u.root.querySelector('.u-axis') as HTMLDivElement;
        if (xAxisEle) {
          renderMarkers(xAxisEle);
        }
      },
    },
  };
}
