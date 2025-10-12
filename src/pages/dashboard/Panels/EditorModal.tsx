import React, { useState, useImperativeHandle, forwardRef } from 'react';
import _ from 'lodash';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { Dashboard } from '@/store/dashboardInterface';
import Editor from '../Editor';
import { updatePanelsWithNewPanel, panelsMergeToConfigs, updatePanelsInsertNewPanelToRow } from './utils';

interface Props {
  range: IRawTimeRange;
  timezone: string;
  setTimezone: (timezone: string) => void;
  dashboard: Dashboard;
  panels: any[];
  setPanels: (panels: any[]) => void;
  updateDashboardConfigs: (dashboardId: number, configs: any) => Promise<any>;
  onUpdated: (res: any) => void;
  editModalVariablecontainerRef: React.RefObject<HTMLDivElement>;
}

function EditorModal(props: Props, ref) {
  const { range, timezone, setTimezone, dashboard, panels, setPanels, updateDashboardConfigs, onUpdated } = props;
  const [editorData, setEditorData] = useState<{
    mode: string;
    visible: boolean;
    id: string;
    initialValues: any;
    panelWidth?: number;
  }>({
    mode: 'add',
    visible: false,
    id: '',
    initialValues: {} as any,
    panelWidth: undefined,
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
      id={editorData.id}
      time={range}
      timezone={timezone}
      setTimezone={setTimezone}
      initialValues={editorData.initialValues}
      panelWidth={editorData.panelWidth}
      onOK={(values, mode) => {
        const newPanels = mode === 'edit' ? updatePanelsWithNewPanel(panels, values) : updatePanelsInsertNewPanelToRow(panels, editorData.id, values);
        setPanels(newPanels);
        updateDashboardConfigs(dashboard.id, {
          configs: panelsMergeToConfigs(dashboard.configs, newPanels),
        }).then((res) => {
          onUpdated(res);
        });
      }}
      editModalVariablecontainerRef={props.editModalVariablecontainerRef}
    />
  );
}

export default forwardRef(EditorModal);
