import React, { useState, forwardRef, useImperativeHandle } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Space } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import useOnClickOutside from '@/components/useOnClickOutside';
import replaceTemplateVariables from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import { IOptions } from '../../../types';

interface Props {
  links: IOptions['links'];
}

export function cellClickCallback(
  cellEvent: any,
  {
    links,
    linksRef,
  }: {
    links: IOptions['links'];
    linksRef: React.RefObject<any>;
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
    const interpolatedUrl = replaceTemplateVariables(link.url, {
      scopedVars: data,
    });
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
  const { links } = props;
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
      className='n9e-dashboard-panel-table-ng-links-popover bg-fc-200 pb-2 min-w-[120px] max-w-[400px] rounded n9e-base-shadow'
      ref={linksPopverRef}
      style={{ display: visible ? 'block' : 'none' }}
    >
      <div className='p-2'>{t('panel.options.links.label')}</div>
      <div>
        {_.map(links, (link, index) => {
          const interpolatedUrl = replaceTemplateVariables(link.url, {
            scopedVars: rowDataItem,
          });
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
