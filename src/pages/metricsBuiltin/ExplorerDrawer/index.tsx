import React, { useState, useEffect } from 'react';
import { Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { Button } from 'antd';
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
  const [panels, setPanels] = useState<Record[]>([]);

  useEffect(() => {
    if (data) {
      const finded = _.find(panels, (panel) => panel.id === data.id);
      if (!finded) {
        setPanels([data, ...panels]);
      }
    }
  }, [data]);

  return (
    <Drawer title={t('explorer')} width={1060} visible={visible} onClose={onClose}>
      {_.map(panels, (panel, idx) => {
        return (
          <>
            <Panel panel={panel} panels={panels} setPanels={setPanels} />
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
          </>
        );
      })}
      <Button
        style={{ width: '100%' }}
        onClick={() => {
          setPanels([...panels, { id: moment().unix() } as Record]);
        }}
      >
        {t('addPanel')}
      </Button>
    </Drawer>
  );
}