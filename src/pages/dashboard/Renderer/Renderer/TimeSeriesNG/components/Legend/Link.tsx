import React from 'react';
import { LinkOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import _ from 'lodash';

import replaceTemplateVariables from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';
import type { DataItem } from '../../utils/getLegendData';
import type { ScopedVariables } from '@/pages/dashboard/types';

interface Props {
  data: DataItem;
  name?: string;
  url?: string;
  style?: React.CSSProperties;
}

export default function Link(props: Props) {
  const { data, name, url, style } = props;
  if (!url) return null;
  const scopedVars: Record<string, string | number | null | undefined> = {
    '__field.name': data.name,
    '__field.value': data.last?.stat,
  };
  _.forEach(data.metric, (value, key) => {
    scopedVars[`__field.labels.${key}`] = value;
  });

  const linkHref = replaceTemplateVariables(url, {
    // 运行时 scopedVars 为扁平字符串映射（非 { value } 结构），仅做类型收窄
    scopedVars: scopedVars as unknown as ScopedVariables,
  });

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
