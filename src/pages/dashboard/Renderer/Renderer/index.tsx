/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useRef, useContext } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import { useInViewport } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Modal, Space, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import TimeRangePicker, { IRawTimeRange } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { useGlobalState } from '@/pages/dashboard/globalState';
import { replaceDatasourceVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import useQuery from '../datasource/useQuery';
import { IPanel } from '../../types';
import Main from './Main';

import './style.less';

export interface IProps {
  panelWidth?: number; // 面板宽度
  datasourceValue?: number; // 全局数据源，如 values.datasourceValue 未设置则用全局数据源
  themeMode?: 'dark';
  id: string;
  time: IRawTimeRange;
  setRange?: (range: IRawTimeRange) => void;
  timezone?: string; // 时区
  setTimezone?: (timezone: string) => void; // 设置时区
  values: IPanel;
  isPreview?: boolean; // 是否是预览，预览中不显示编辑和分享
  isAuthorized?: boolean; // 是否有权限
  annotations: any[];
  onCloneClick?: () => void;
  onShareClick?: () => void;
  onEditClick?: (panelWidth?: number) => void;
  onDeleteClick?: () => void;
  onCopyClick?: () => void;
  setAnnotationsRefreshFlag?: (flag: string) => void;
}

function index(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { panelWidth, datasourceValue, id, time, setRange, timezone, setTimezone, isPreview } = props;
  const { datasourceList } = useContext(CommonStateContext);
  const values = _.cloneDeep(props.values);
  const containerEleRef = useRef<HTMLDivElement>(null);
  const [inViewPort] = useInViewport(containerEleRef);
  const [inspect, setInspect] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const viewModalContainerRef = useRef<HTMLDivElement>(null);

  let currentDatasourceValue = values.datasourceValue || datasourceValue;
  currentDatasourceValue = currentDatasourceValue
    ? replaceDatasourceVariables(currentDatasourceValue, {
        datasourceList,
      })
    : currentDatasourceValue;

  const queryResult = useQuery({
    panelWidth,
    id,
    time,
    targets: values.targets,
    inViewPort: isPreview || inViewPort,
    datasourceCate: values.datasourceCate || 'prometheus',
    datasourceValue: currentDatasourceValue,
    spanNulls: values.custom?.spanNulls,
    scopedVars: values.scopedVars,
    inspect,
    type: values.type,
    custom: values.custom,
  });

  if (_.isEmpty(values)) return null;

  return (
    <div className='h-full' ref={containerEleRef}>
      <Main
        {..._.omit(props)}
        controllersVisible
        queryResult={queryResult}
        containerEleRef={containerEleRef}
        time={time}
        setTime={setRange}
        timezone={timezone}
        inspect={inspect}
        setInspect={setInspect}
        setViewModalVisible={setViewModalVisible}
      />
      <Modal
        visible={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
        }}
        title={
          <div className='flex items-center justify-between'>
            {t('common:btn.view')}
            <Space>
              <TimeRangePicker dateFormat='YYYY-MM-DD HH:mm:ss' value={time} onChange={setRange} showTimezone timezone={timezone} onTimezoneChange={setTimezone} />
              <Button
                type='text'
                icon={<CloseOutlined />}
                onClick={() => {
                  setViewModalVisible(false);
                }}
              ></Button>
            </Space>
          </div>
        }
        closable={false}
        footer={null}
        forceRender
        destroyOnClose
        width='100%'
        className='n9e-dashboard-editor-modal'
        style={{ top: 0, padding: 0 }}
        bodyStyle={{
          height: 'calc(100% - 65px)',
        }}
      >
        <div className='h-full' ref={viewModalContainerRef} />
      </Modal>
      {viewModalContainerRef.current &&
        viewModalVisible &&
        createPortal(
          <Main
            {..._.omit(props)}
            isPreview
            controllersVisible={false}
            queryResult={queryResult}
            containerEleRef={containerEleRef}
            time={time}
            setTime={setRange}
            timezone={timezone}
            inspect={inspect}
            setInspect={setInspect}
            setViewModalVisible={setViewModalVisible}
          />,
          viewModalContainerRef.current,
        )}
    </div>
  );
}

export default React.memo(index, (prevProps, nextProps) => {
  const omitKeys = ['setRange', 'onCloneClick', 'onShareClick', 'onEditClick', 'onDeleteClick', 'onCopyClick', 'setAnnotationsRefreshFlag'];
  return _.isEqual(_.omit(prevProps, omitKeys), _.omit(nextProps, omitKeys));
});
