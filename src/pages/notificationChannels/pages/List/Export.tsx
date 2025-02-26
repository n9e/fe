import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Input, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { download, copyToClipBoard } from '@/utils';

interface IProps {
  data: string;
}

function Export(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('alertRules');
  const { visible, destroy } = props;
  const [data, setData] = useState(props.data);
  return (
    <Modal
      title={t('batch.export.title')}
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      footer={[
        <Button
          key='download'
          onClick={() => {
            download([data], 'download.json');
          }}
        >
          {t('common:download_json')}
        </Button>,
        <Button key='copy' style={{ float: 'right' }} onClick={() => copyToClipBoard(data)}>
          <CopyOutlined />
          {t('common:batch.export.copy')}
        </Button>,
      ]}
    >
      <Input.TextArea
        value={data}
        onChange={(e) => {
          setData(e.target.value);
        }}
        rows={15}
      />
    </Modal>
  );
}

export default ModalHOC(Export);
