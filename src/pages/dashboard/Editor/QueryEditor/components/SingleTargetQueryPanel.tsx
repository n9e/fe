import React from 'react';
import { Space } from 'antd';

import Collapse, { Panel } from '../../Components/Collapse';

interface Props {
  refId?: string;
  datasourceSelect: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function SingleTargetQueryPanel({ refId, datasourceSelect, actions, children }: Props) {
  return (
    <Collapse>
      <Panel
        header={
          <Space>
            <strong>{refId}</strong>
            <span
              data-testid='mixed-query-datasource'
              onClick={(event) => {
                event.stopPropagation();
              }}
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
            >
              {datasourceSelect}
            </span>
          </Space>
        }
        extra={actions}
      >
        <div className='n9e-dashboard-single-target-query-editor-content'>{children}</div>
      </Panel>
    </Collapse>
  );
}
