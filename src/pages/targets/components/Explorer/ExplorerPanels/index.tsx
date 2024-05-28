import React, { useEffect } from 'react';
import { Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { Button } from 'antd';
import { useGetState } from 'ahooks';
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
  data?: Record;
}

export default function ExplorerDrawer(props: Props) {
  const { t } = useTranslation('metricsBuiltin');
  const { data } = props;
  const [panels, setPanels, getPanels] = useGetState<Record[]>([]);

  useEffect(() => {
    if (data) {
      const finded = _.find(panels, (panel) => panel.id === data.id && panel.expression === data.expression);
      if (!finded) {
        setPanels([
          {
            ...data,
            uid: moment().unix(),
          },
          ...panels,
        ]);
      } else {
        // 存在的面板再次点击后，移动到最前面
        const newPanels = _.filter(panels, (panel) => panel.id !== data.id || panel.expression !== data.expression);
        setPanels([finded, ...newPanels]);
      }
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
            />
            {idx === 0 && panels.length > 1 && (
              <Button
                danger
                ghost
                type='dashed'
                className='mb2'
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
