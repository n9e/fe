import React, { useState } from 'react';
import { Button, Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import { Record, buildLabelFilterAndExpression } from '@/pages/metricsBuiltin/services';
import { ExplorerIcon } from './constant';
import Metrics from './Metrics';
import ExplorerPanels from './ExplorerPanels';
import './style.less';

interface Props {
  selectedIdents: string[];
}

export default function index(props: Props) {
  const { t } = useTranslation('targets');
  const { selectedIdents } = props;
  const [visible, setVisible] = useState(false);
  const [explorerDrawerData, setExplorerDrawerData] = useState<Record>();

  return (
    <>
      <Button
        icon={<ExplorerIcon />}
        disabled={selectedIdents.length === 0}
        onClick={() => {
          setVisible(true);
        }}
      />
      <Drawer
        visible={visible}
        title={t('metricsBuiltin:title')}
        width={1200}
        onClose={() => {
          setVisible(false);
          setExplorerDrawerData(undefined);
        }}
        destroyOnClose
      >
        <div className='n9e-hosts-explorer-metrics-container'>
          <div className='n9e-hosts-explorer-metrics-list'>
            <Metrics setExplorerDrawerData={setExplorerDrawerData} selectedIdents={selectedIdents} />
          </div>
          <div className='n9e-hosts-explorer-metrics-main'>
            <ExplorerPanels data={explorerDrawerData} />
          </div>
        </div>
      </Drawer>
    </>
  );
}
