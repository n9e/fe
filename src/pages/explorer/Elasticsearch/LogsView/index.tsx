import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import { Modal } from 'antd';

import { Props } from './types';
import Main from './Main';

export default function index(props: Props) {
  const viewModalContainerRef = useRef<HTMLDivElement>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  return (
    <>
      <Main {..._.omit(props)} viewModalVisible={viewModalVisible} setViewModalVisible={setViewModalVisible} />
      <Modal
        visible={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
        }}
        closable={false}
        footer={null}
        forceRender
        destroyOnClose
        width='100%'
        className='n9e-antd-modal-full'
        style={{ top: 0, padding: 0 }}
        bodyStyle={{
          height: '100%',
        }}
      >
        <div className='h-full flex flex-col' ref={viewModalContainerRef} />
      </Modal>
      {viewModalContainerRef.current &&
        viewModalVisible &&
        createPortal(<Main {..._.omit(props)} viewModalVisible={viewModalVisible} setViewModalVisible={setViewModalVisible} />, viewModalContainerRef.current)}
    </>
  );
}
