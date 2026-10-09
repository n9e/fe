import React, { useContext } from 'react';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { IRawTimeRange } from '@/components/TimeRangePicker';

import Renderer from '../dashboard/Renderer/Renderer';
import { DashboardRuntimeProvider } from '../dashboard/globalState';

interface Props {
  width: number;
  item: any;
  range: IRawTimeRange;
}

/**
 * 临时图（/chart/:ids）里的单个图表。
 *
 * 该路由不在仪表盘页面内，没有dashboard 运行时容器；面板查询与渲染都依赖它，
 * 因此显式创建隔离实例（临时图没有仪表盘变量，空实例即为正确语义）。
 */
export default function Main(props: Props) {
  return (
    <DashboardRuntimeProvider>
      <MainContent {...props} />
    </DashboardRuntimeProvider>
  );
}

function MainContent(props: Props) {
  const { darkMode } = useContext(CommonStateContext);
  const { width, item, range } = props;

  return (
    <div style={{ height: 740 }}>
      <Renderer
        id={item.dataProps.id}
        panelWidth={width}
        time={range}
        values={_.merge({}, item.dataProps, {
          options: {
            legend: {
              displayMode: 'table',
            },
          },
        })}
        isPreview
        themeMode={darkMode ? 'dark' : undefined}
        annotations={[]}
      />
    </div>
  );
}
