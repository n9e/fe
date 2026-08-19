import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getDashboard } from '@/services/dashboardV2';

import SharingLinkSection from './SharingLinkSection';

interface IProps {
  boardId: number;
}

// 仪表盘详情页的独立分享入口。列表页的分享能力内嵌在「公开」弹窗里（PublicForm），
// 两者共用 SharingLinkSection
function SharingLinkModal(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('dashboard');
  const { visible, destroy, boardId } = props;
  // 读取失败时按「不确定 → 不允许匿名」保守降级
  const [hasHostIdentVariable, setHasHostIdentVariable] = useState<boolean>(false);

  useEffect(() => {
    getDashboard(boardId)
      .then((res) => {
        try {
          const configs = JSON.parse(res.configs);
          setHasHostIdentVariable(
            _.some(configs.var, (item) => {
              return item.type === 'hostIdent';
            }),
          );
        } catch (e) {
          console.error(e);
        }
      })
      .catch((error) => {
        console.error(error);
        setHasHostIdentVariable(true);
      });
  }, [boardId]);

  return (
    <Modal title={t('sharing_link.title')} visible={visible} footer={null} width={800} onCancel={destroy}>
      <SharingLinkSection boardId={boardId} hasHostIdentVariable={hasHostIdentVariable} />
    </Modal>
  );
}

export default ModalHOC<IProps>(SharingLinkModal);
