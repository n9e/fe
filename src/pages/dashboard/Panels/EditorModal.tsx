import React, { useState, useImperativeHandle, forwardRef } from 'react';
import _ from 'lodash';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { Dashboard } from '@/store/dashboardInterface';
import Editor from '../Editor';
import { updatePanelsWithNewPanel, panelsMergeToConfigs, updatePanelsInsertNewPanelToRow } from './utils';

interface Props {
  dashboardId: string;
  variableConfig: any;
  range: IRawTimeRange;
  dashboard: Dashboard;
  panels: any[];
  setPanels: (panels: any[]) => void;
  updateDashboardConfigs: (dashboardId: number, configs: any) => Promise<any>;
  onUpdated: (res: any) => void;
}

function EditorModal(props: Props, ref) {
  const { dashboardId, variableConfig, range, dashboard, panels, setPanels, updateDashboardConfigs, onUpdated } = props;
  const [editorData, setEditorData] = useState({
    mode: 'add',
    visible: false,
    id: '',
    initialValues: {} as any,
  });

  useImperativeHandle(
    ref,
    () => ({
      setEditorData,
    }),
    [],
  );

  return (
    <Editor
      mode={editorData.mode}
      visible={editorData.visible}
      setVisible={(visible) => {
        setEditorData({
          ...editorData,
          visible,
        });
      }}
      variableConfigWithOptions={variableConfig}
      id={editorData.id}
      dashboardId={_.toString(dashboardId)}
      time={range}
      initialValues={editorData.initialValues}
      onOK={(values, mode) => {
        const newPanels = mode === 'edit' ? updatePanelsWithNewPanel(panels, values) : updatePanelsInsertNewPanelToRow(panels, editorData.id, values);
        setPanels(newPanels);
        updateDashboardConfigs(dashboard.id, {
          configs: panelsMergeToConfigs(dashboard.configs, newPanels),
        }).then((res) => {
          onUpdated(res);
        });
      }}
    />
  );
}

export default forwardRef(EditorModal);
