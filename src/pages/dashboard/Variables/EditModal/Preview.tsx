import React, { useState } from 'react';
import { Alert, Button, Table, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

interface Props {
  errorMsg?: string;
  options?: {
    label: string;
    value: string;
  }[];
  run?: () => void;
  loading?: boolean;
}

export default function Preview(props: Props) {
  const { t } = useTranslation('dashboard');
  const { errorMsg, options, run, loading } = props;
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          run && run();
          setModalVisible(true);
        }}
      >
        {t('common:btn.data_preview')}
      </Button>
      <Modal title={t('common:btn.data_preview')} visible={modalVisible} onCancel={() => setModalVisible(false)} footer={null} width={800}>
        <div>
          {errorMsg && <Alert className='mb-4' type='error' message={errorMsg} />}
          <Table
            rowKey='value'
            scroll={{ x: 'max-content' }}
            size='small'
            loading={loading}
            dataSource={options}
            columns={[
              {
                title: 'Name',
                dataIndex: 'label',
                key: 'label',
              },
              {
                title: 'Value',
                dataIndex: 'value',
                key: 'value',
              },
            ]}
          />
        </div>
      </Modal>
    </>
  );
}
