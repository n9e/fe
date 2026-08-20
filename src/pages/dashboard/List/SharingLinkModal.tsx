import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getDashboard } from '@/services/dashboardV2';

import SharingLinkSection, { HostIdentState } from './SharingLinkSection';

interface IProps {
  boardId: number;
}

// 仪表盘详情页的独立分享入口。列表页的分享能力内嵌在「公开」弹窗里（PublicForm），
// 两者共用 SharingLinkSection
function SharingLinkModal(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('dashboard');
  const { visible, destroy, boardId } = props;
  // 三态而非 boolean：初值 checking，探测返回前不放行签发；
  // 请求失败与 JSON 解析失败两条「不确定」路径统一 blocked
  const [hostIdentState, setHostIdentState] = useState<HostIdentState>('checking');

  useEffect(() => {
    setHostIdentState('checking');
    getDashboard(boardId)
      .then((res) => {
        try {
          const configs = JSON.parse(res.configs);
          const has = _.some(configs.var, (item) => {
            return item.type === 'hostIdent';
          });
          setHostIdentState(has ? 'blocked' : 'allowed');
        } catch (e) {
          console.error(e);
          setHostIdentState('blocked');
        }
      })
      .catch((error) => {
        console.error(error);
        setHostIdentState('blocked');
      });
  }, [boardId]);

  return (
    <Modal title={t('sharing_link.title')} visible={visible} footer={null} width={800} onCancel={destroy}>
      <SharingLinkSection boardId={boardId} hostIdentState={hostIdentState} />
    </Modal>
  );
}

export default ModalHOC<IProps>(SharingLinkModal);
