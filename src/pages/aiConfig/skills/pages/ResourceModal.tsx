import React from 'react';
import { Modal, Spin } from 'antd';
import { useRequest } from 'ahooks';

import { getFile } from '../services';

interface Props {
  id: number;
  name: string;
  visible: boolean;
  onClose: () => void;
}

export default function ResourceModal(props: Props) {
  const { id, name, visible, onClose } = props;

  const { data, loading } = useRequest(() => getFile(id), {
    refreshDeps: [id],
  });

  return (
    <Modal title={name} visible={visible} onCancel={onClose} footer={null}>
      <Spin spinning={loading}>
        <div className='max-h-[400px] best-looking-scroll'>
          <pre className='whitespace-pre-wrap break-all'>{data?.content}</pre>
        </div>
      </Spin>
    </Modal>
  );
}
