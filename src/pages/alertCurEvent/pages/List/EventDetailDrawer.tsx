import React from 'react';
import { Drawer } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import DetailNG from '@/pages/event/DetailNG';
import getActions from '@/pages/event/DetailNG/Actions';

import { NS } from '../../constants';

interface Props {
  visible: boolean;
  data: any;
  onClose: () => void;
  onDeleteSuccess: () => void;
}

export default function EventDetailDrawer(props: Props) {
  const { t } = useTranslation(NS);
  const { visible, onClose, data, onDeleteSuccess } = props;

  return (
    <Drawer
      width='80%'
      closable={false}
      title={t('detail_title')}
      destroyOnClose
      extra={<CloseOutlined onClick={() => onClose()} />}
      onClose={() => onClose()}
      visible={visible}
      footer={getActions({
        eventDetail: data,
        showDeleteBtn: true,
        onDeleteSuccess: () => {
          onClose();
          onDeleteSuccess();
        },
      })}
    >
      {data && <DetailNG data={data} showGraph />}
    </Drawer>
  );
}
