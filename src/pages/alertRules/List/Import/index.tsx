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
import React, { useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Modal, Tabs } from 'antd';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import ImportBuiltinContent from './ImportBuiltinContent';
import ImportBase from './ImportBase';
import ImportPrometheus from './ImportPrometheus';

type ModalType = 'Import' | 'ImportBuiltin' | 'ImportPrometheus';
interface IProps {
  busiId: number;
  refreshList: () => void;
  groupedDatasourceList: any;
  reloadGroupedDatasourceList: any;
  datasourceCateOptions: any;
  type?: ModalType;
}

const TabPane = Tabs.TabPane;

function Import(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('alertRules');
  const { visible, destroy, busiId, refreshList, groupedDatasourceList, reloadGroupedDatasourceList, datasourceCateOptions, type = 'ImportBuiltin' } = props;
  const [modalType, setModalType] = useState(type);

  return (
    <Modal
      className='dashboard-import-modal'
      title={
        <Tabs activeKey={modalType} onChange={(e: ModalType) => setModalType(e)} className='custom-import-alert-title'>
          <TabPane tab={t('batch.import_builtin')} key='ImportBuiltin'></TabPane>
          <TabPane tab={t('batch.import.title')} key='Import'></TabPane>
          <TabPane tab={t('batch.import_prometheus')} key='ImportPrometheus'></TabPane>
        </Tabs>
      }
      visible={visible}
      onCancel={() => {
        refreshList();
        destroy();
      }}
      footer={null}
    >
      {modalType === 'Import' && (
        <ImportBase
          busiId={busiId}
          onOk={() => {
            refreshList();
            destroy();
          }}
          groupedDatasourceList={groupedDatasourceList}
          reloadGroupedDatasourceList={reloadGroupedDatasourceList}
          datasourceCateOptions={datasourceCateOptions}
        />
      )}
      {modalType === 'ImportBuiltin' && (
        <ImportBuiltinContent
          busiId={busiId}
          onOk={() => {
            refreshList();
            destroy();
          }}
          groupedDatasourceList={groupedDatasourceList}
          reloadGroupedDatasourceList={reloadGroupedDatasourceList}
          datasourceCateOptions={datasourceCateOptions}
        />
      )}
      {modalType === 'ImportPrometheus' && (
        <ImportPrometheus
          busiId={busiId}
          onOk={() => {
            refreshList();
            destroy();
          }}
          groupedDatasourceList={groupedDatasourceList}
          reloadGroupedDatasourceList={reloadGroupedDatasourceList}
        />
      )}
    </Modal>
  );
}

export default ModalHOC(Import);
