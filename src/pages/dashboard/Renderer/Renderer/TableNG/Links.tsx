import React, { useState, forwardRef, useImperativeHandle } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Space } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import { IRawTimeRange } from '@/components/TimeRangePicker';
import useOnClickOutside from '@/components/useOnClickOutside';
import { useGlobalState } from '@/pages/dashboard/globalState';

import { IOptions } from '../../../types';
import interpolateTemplate from '../../utils/interpolateTemplate';

interface Props {
  links: IOptions['links'];
  time: IRawTimeRange;
}

export function cellClickCallback(
  cellEvent: any,
  {
    links,
    linksRef,
    dashboardMeta,
    time,
  }: {
    links: IOptions['links'];
    linksRef: React.RefObject<any>;
    dashboardMeta: {
      dashboardId: string;
      variableConfigWithOptions: any;
      graphTooltip: string;
      graphZoom: string;
    };
    time: IRawTimeRange;
  },
) {
  if (_.isEmpty(links)) return;

  const data: {
    [key: string]: string | number | null;
  } = {};
  _.forEach(cellEvent.data, (valueState, key) => {
    data[`__row.${key}`] = valueState.value;
  });

  if (links?.length === 1) {
    const link = links[0];
    const interpolatedUrl = interpolateTemplate(link.url, data, { dashboardMeta, time });
    window.open(interpolatedUrl, link.targetBlank ? '_blank' : '_self');
  } else {
    const event = cellEvent.event as any;
    const { x: left, y: top } = event || {};
    if (left !== undefined && top !== undefined) {
      linksRef.current?.show(data, { left, top });
    }
  }
}

function Links(props: Props, ref) {
  const { t } = useTranslation('dashboard');
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const { links, time } = props;
  const [visible, setVisible] = useState(false);
  const [rowDataItem, setRowDataItem] = useState<{
    [key: string]: string | number | null;
  }>({});
  const linksPopverRef = React.useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => {
      return {
        show: (item, { left, top }) => {
          setRowDataItem(item);
          setVisible(true);
          (window as any).placement(
            linksPopverRef.current,
            {
              left,
              top,
            },
            'right',
            'start',
            { bound: document.body },
          );
        },
      };
    },
    [],
  );

  useOnClickOutside(linksPopverRef, () => {
    setVisible(false);
  });

  return (
    <div
      className='n9e-dashboard-panel-table-ng-links-popover n9e-fill-color-3 pb-2 min-w-[120px] max-w-[400px] rounded n9e-base-shadow'
      ref={linksPopverRef}
      style={{ display: visible ? 'block' : 'none' }}
    >
      <div className='p-2'>{t('panel.options.links.label')}</div>
      <div>
        {_.map(links, (link, index) => {
          const interpolatedUrl = interpolateTemplate(link.url, rowDataItem, { dashboardMeta, time });
          return (
            <div key={index} className='py-1.5 px-2 n9e-dashboard-panel-table-ng-links-item'>
              <a href={interpolatedUrl} target={link.targetBlank ? '_blank' : '_self'} rel='noopener noreferrer'>
                <Space>
                  <LinkOutlined />
                  {link.title}
                </Space>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default forwardRef(Links);
