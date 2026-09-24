import React from 'react';
import { LinkOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import _ from 'lodash';

import { DashboardRuntimeProvider, useDashboardRuntimeStoreIfAvailable } from '@/pages/dashboard/globalState';
import { useReplaceTemplateVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';
import type { DataItem } from '../../utils/getLegendData';
import type { ScopedVariables } from '@/pages/dashboard/types';

interface Props {
  data: DataItem;
  name?: string;
  url?: string;
  style?: React.CSSProperties;
}

/**
 * 渲染图例详情链接，并为探索页等仪表盘外调用提供隔离的运行时容器。
 *
 * 已位于仪表盘内时复用父级实例，外部调用时只创建本组件所需的空实例，避免回退模块级共享状态。
 */
export default function Link(props: Props) {
  const dashboardRuntimeStore = useDashboardRuntimeStoreIfAvailable();

  if (!dashboardRuntimeStore) {
    return (
      <DashboardRuntimeProvider>
        <LinkContent {...props} />
      </DashboardRuntimeProvider>
    );
  }

  return <LinkContent {...props} />;
}

/** 根据所属运行时解析变量，并生成图例详情跳转入口。 */
function LinkContent(props: Props) {
  const replaceTemplateVariables = useReplaceTemplateVariables();
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
