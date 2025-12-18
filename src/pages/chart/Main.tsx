import React, { useContext } from 'react';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { IRawTimeRange } from '@/components/TimeRangePicker';

import Renderer from '../dashboard/Renderer/Renderer';

interface Props {
  width: number;
  item: any;
  range: IRawTimeRange;
}

export default function Main(props: Props) {
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
