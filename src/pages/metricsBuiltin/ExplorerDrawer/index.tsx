import React, { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { Button } from 'antd';
import { useGetState } from 'ahooks';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { Record } from '../services';
import Panel from './Panel';

interface Props {
  visible: boolean;
  onClose: () => void;
  data?: Record;
}

export default function ExplorerDrawer(props: Props) {
  const { t } = useTranslation('metricsBuiltin');
  const { visible, onClose, data } = props;
  const [panels, setPanels, getPanels] = useGetState<Record[]>([]);
  const [defaultType, setDefaultType] = useState<'table' | 'graph'>('table');
  const [defaultTime, setDefaultTime] = useState<undefined | IRawTimeRange>();

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
    <Drawer title={t('explorer')} width={1060} visible={visible} onClose={onClose}>
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
      <Button
        style={{ width: '100%' }}
        onClick={() => {
          setPanels([...panels, { uid: moment().unix() } as Record]);
        }}
      >
        {t('addPanel')}
      </Button>
    </Drawer>
  );
}
