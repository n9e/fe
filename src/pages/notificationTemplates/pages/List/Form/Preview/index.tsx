import { Modal } from 'antd';
import React from 'react';

interface Props {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export default function index(props: Props) {
  const { visible, setVisible } = props;
  const [resultModalVisible, setResultModalVisible] = React.useState(false);

  return (
    <>
      <Modal visible={visible} title='选择'></Modal>
    </>
  );
}
