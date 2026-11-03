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
  inline?: boolean;
  defaultDatasourceId?: number;
}

export default function index(props: Props) {
  const { t } = useTranslation('targets');
  const { selectedIdents } = props;
  const [visible, setVisible] = useState(false);
  const [explorerDrawerData, setExplorerDrawerData] = useState<Record | Record[]>();

  const content = (
    <div className='n9e-hosts-explorer-metrics-container'>
      <div className='n9e-hosts-explorer-metrics-list'>
        <Metrics setExplorerDrawerData={setExplorerDrawerData} selectedIdents={selectedIdents} inline={props.inline} />
      </div>
      <div className='n9e-hosts-explorer-metrics-main'>
        <ExplorerPanels data={explorerDrawerData} defaultDatasourceId={props.defaultDatasourceId} />
      </div>
    </div>
  );

  if (props.inline) return content;

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
        width='90%'
        onClose={() => {
          setVisible(false);
          setExplorerDrawerData(undefined);
        }}
        destroyOnClose
        className='n9e-antd-drawer'
      >
        {content}
      </Drawer>
    </>
  );
}
