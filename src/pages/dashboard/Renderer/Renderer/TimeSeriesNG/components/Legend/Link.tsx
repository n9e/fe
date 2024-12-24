import React from 'react';
import { LinkOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import _ from 'lodash';

import { IRawTimeRange } from '@/components/TimeRangePicker';

import { getDetailUrl } from '../../../../utils/replaceExpressionDetail';
import { useGlobalState } from '../../../../../globalState';

interface Props {
  data: any;
  range?: IRawTimeRange;
  name?: string;
  url?: string;
  style?: React.CSSProperties;
}

export default function Link(props: Props) {
  const { data, range, name, url, style } = props;
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  if (!url || !range) return null;
  const linkHref = getDetailUrl(url, data, dashboardMeta, range);

  return (
    <Tooltip
      placement='top'
      overlayInnerStyle={{
        maxWidth: 300,
      }}
      title={
        <a
          href={linkHref}
          target='_blank'
          style={{
            color: '#fff',
            textDecoration: 'underline',
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {name}
        </a>
      }
    >
      <LinkOutlined
        style={style}
        onMouseEnter={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
        }}
      />
    </Tooltip>
  );
}
