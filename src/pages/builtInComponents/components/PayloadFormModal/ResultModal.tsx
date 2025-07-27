import React from 'react';
import { Modal, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';

interface ResultModalProps {
  data: {
    [key: string]: string;
  };
}

function ResultModal(props: ResultModalProps & ModalWrapProps) {
  const { t } = useTranslation();
  const { visible, destroy, data } = props;

  return (
    <Modal title={t('common:error.create')} visible={visible} onCancel={destroy} width={600} footer={null}>
      <Table
        size='small'
        dataSource={_.map(data, (v, k) => {
          return {
            name: k,
            error: v,
          };
        })}
        columns={[
          {
            title: t('common:table.name'),
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: t('common:table.error_msg'),
            dataIndex: 'error',
            key: 'error',
          },
        ]}
        pagination={false}
      />
    </Modal>
  );
}

export default ModalHOC<ResultModalProps>(ResultModal);
