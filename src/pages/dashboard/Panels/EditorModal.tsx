import React, { useState, useImperativeHandle, forwardRef } from 'react';
import _ from 'lodash';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import Editor from '../Editor';
import { updatePanelsWithNewPanel, updatePanelsInsertNewPanelToRow, processRepeats } from './utils';
import { useGlobalState } from '@/pages/dashboard/globalState';
import type { IPanel } from '../types';

export interface EditorModalData {
  mode: 'add' | 'edit';
  visible: boolean;
  id: string;
  initialValues: IPanel;
  panelWidth?: number;
}

export interface EditorModalHandle {
  setEditorData: React.Dispatch<React.SetStateAction<EditorModalData>>;
}

interface Props {
  range: IRawTimeRange;
  timezone: string;
  setTimezone: (timezone: string) => void;
  panels: IPanel[];
  setPanels: (panels: IPanel[]) => void;
  onPanelsChange: (panels: IPanel[]) => void;
  editModalVariablecontainerRef: React.RefObject<HTMLDivElement>;
}

function EditorModal(props: Props, ref: React.ForwardedRef<EditorModalHandle>) {
  const { range, timezone, setTimezone, panels, setPanels, onPanelsChange } = props;
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');
  const [editorData, setEditorData] = useState<EditorModalData>({
    mode: 'add',
    visible: false,
    id: '',
    initialValues: {} as IPanel,
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
        /** Applies the editor's complete panel result to the page-local dashboard config. */
        const newPanels = mode === 'edit' ? updatePanelsWithNewPanel(panels, values) : updatePanelsInsertNewPanelToRow(panels, editorData.id, values);
        // 立即根据当前变量值重新计算 repeat，保证保存后 UI 立刻生效
        const processedPanels = processRepeats(newPanels, variablesWithOptions);
        setPanels(processedPanels);
        onPanelsChange(newPanels);
      }}
      editModalVariablecontainerRef={props.editModalVariablecontainerRef}
    />
  );
}

export default forwardRef<EditorModalHandle, Props>(EditorModal);
