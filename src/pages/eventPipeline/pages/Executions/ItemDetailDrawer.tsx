import React from 'react';
import { Drawer, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NS } from '../../constants';
import Detail from './Detail';

interface Props {
  id: string | null;
  visible: boolean;
  onClose: () => void;
}

export default function ItemDetaildrawer(props: Props) {
  const { t } = useTranslation(NS);
  const { id, visible, onClose } = props;

  return (
    <Drawer width='80%' title={<Space>{t('executions.detail_title')}</Space>} placement='right' onClose={onClose} visible={visible}>
      {id && <Detail id={id} />}
    </Drawer>
  );
}
