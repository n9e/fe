import React from 'react';
import { LinkOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import _ from 'lodash';

import replaceTemplateVariables from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

interface Props {
  data: any;
  name?: string;
  url?: string;
  style?: React.CSSProperties;
}

export default function Link(props: Props) {
  const { data, name, url, style } = props;
  if (!url) return null;
  const scopedVars = {
    '__field.name': data.name,
    '__field.value': data.last?.stat,
  };
  _.forEach(data.metric, (value, key) => {
    scopedVars[`__field.labels.${key}`] = value;
  });

  const linkHref = replaceTemplateVariables(url, {
    scopedVars,
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
