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
      setPanels([data]);
    }
  }, [data]);

  return (
    <Drawer title={t('explorer')} width={1060} visible={visible} onClose={onClose}>
      {_.map(panels, (panel) => {
        return <Panel panel={panel} panels={panels} setPanels={setPanels} />;
      })}
      <Button
        style={{ width: '100%' }}
        onClick={() => {
          setPanels([...panels, { id: moment().unix() } as Record]);
        }}
      >
        Add Panel
      </Button>
    </Drawer>
  );
}
