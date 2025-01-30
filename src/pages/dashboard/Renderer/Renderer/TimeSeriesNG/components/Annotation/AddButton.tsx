import React, { useEffect } from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import uPlot from 'uplot';
import moment from 'moment';

import { postAnnotations } from '@/services/dashboardV2';

import FormModal, { Values } from './FormModal';

interface Props {
  uplotRef: React.MutableRefObject<uPlot>;
  dashboardID: number;
  panelID: string;
  closeOverlay: () => void;
  setAnnotationSettingUp: (settingUp: boolean) => void;
  onOk: () => void;
}

export default function AddButton(props: Props) {
  const { t } = useTranslation('dashboard');
  const { uplotRef, dashboardID, panelID, closeOverlay, setAnnotationSettingUp, onOk } = props;
  const [visible, setVisible] = React.useState(false);
  const [initialValues, setInitialValues] = React.useState({} as Values);
  const handleAdd = () => {
    const u = uplotRef.current;
    if (u) {
      const cursorLeft = u.cursor.left;
      if (cursorLeft) {
        const time = moment.unix(u.posToVal(cursorLeft, 'x')).unix();
        setInitialValues({
          dashboard_id: dashboardID,
          panel_id: panelID,
          time_start: time,
          time_end: time,
        } as Values);
        setVisible(true);
      }
    }
  };

  useEffect(() => {
    const u = uplotRef.current;
    if (u) {
      const over = u.over;
      let oldCursorLeft: number | undefined = 0;
      const handleMouseDown = (e: MouseEvent) => {
        oldCursorLeft = u.cursor.left;
      };
      const handleMouseUp = (e: MouseEvent) => {
        if (e.metaKey) {
          e.stopPropagation();
          closeOverlay();
          setAnnotationSettingUp(true);
          const curCursorLeft = u.cursor.left;
          if (curCursorLeft === oldCursorLeft) {
            handleAdd();
          } else {
            if (oldCursorLeft !== undefined && curCursorLeft !== undefined) {
              const timeStart = moment.unix(u.posToVal(oldCursorLeft, 'x')).unix();
              const timeEnd = moment.unix(u.posToVal(curCursorLeft, 'x')).unix();
              setInitialValues({
                dashboard_id: dashboardID,
                panel_id: panelID,
                time_start: timeStart,
                time_end: timeEnd,
              } as Values);
              setVisible(true);
            }
          }
        }
      };
      over.addEventListener('mousedown', handleMouseDown);
      over.addEventListener('mouseup', handleMouseUp);
      return () => {
        over.removeEventListener('mousedown', handleMouseDown);
        over.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, []);

  return (
    <>
      <Button
        size='small'
        onClick={() => {
          closeOverlay();
          handleAdd();
        }}
      >
        {t('annotation.add')}
      </Button>
      <FormModal
        visible={visible}
        action='add'
        onOk={(values) => {
          postAnnotations(values).then(() => {
            onOk();
          });
          setVisible(false);
          setAnnotationSettingUp(false);
        }}
        onCancel={() => {
          setVisible(false);
          setAnnotationSettingUp(false);
        }}
        initialValues={initialValues}
      />
    </>
  );
}
