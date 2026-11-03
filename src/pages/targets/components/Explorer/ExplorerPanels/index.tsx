import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Button } from 'antd';
import { useGetState } from 'ahooks';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import Panel from './Panel';

export interface Record {
  uid: number; // 只是用于 panel 的 id
  id: number;
  collector: string;
  typ: string;
  name: string;
  unit: string;
  note: string;
  expression?: string;
}

interface Props {
  data?: Record | Record[];
  defaultDatasourceId?: number;
}

export default function ExplorerDrawer(props: Props) {
  const { t } = useTranslation('metricsBuiltin');
  const { data, defaultDatasourceId } = props;
  const [panels, setPanels, getPanels] = useGetState<Record[]>([]);
  const [defaultType, setDefaultType] = useState<'table' | 'graph'>('table');
  const [defaultTime, setDefaultTime] = useState<undefined | IRawTimeRange>();

  useEffect(() => {
    if (data) {
      let nextPanels = panels;
      for (const metric of Array.isArray(data) ? data.slice().reverse() : [data]) {
        const found = _.find(nextPanels, (panel) => panel.id === metric.id && panel.expression === metric.expression);
        if (!found) {
          nextPanels = [{ ...metric, uid: Math.max(Date.now(), ...nextPanels.map((panel) => panel.uid + 1)) }, ...nextPanels];
        } else {
          // 存在的面板再次点击后，移动到最前面
          nextPanels = [found, ..._.filter(nextPanels, (panel) => panel.id !== metric.id || panel.expression !== metric.expression)];
        }
      }
      setPanels(nextPanels);
    }
  }, [data]);

  return (
    <div>
      {_.map(panels, (panel, idx) => {
        return (
          <div key={panel.uid}>
            <Panel
              panel={panel}
              panels={panels}
              setPanels={setPanels}
              onChange={(promQL) => {
                const newPanels = _.map(getPanels(), (item) => {
                  if (item.uid === panel.uid) {
                    return {
                      ...item,
                      expression: promQL,
                    };
                  }
                  return item;
                });
                setPanels(newPanels);
              }}
              defaultType={defaultType}
              onDefaultTypeChange={setDefaultType}
              defaultTime={defaultTime}
              onDefaultTimeChange={setDefaultTime}
              defaultDatasourceId={defaultDatasourceId}
            />
            {idx === 0 && panels.length > 1 && (
              <Button
                danger
                ghost
                type='dashed'
                className='mb-4'
                style={{ width: '100%' }}
                onClick={() => {
                  setPanels([panels[0]]);
                }}
              >
                {t('closePanelsBelow')}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
