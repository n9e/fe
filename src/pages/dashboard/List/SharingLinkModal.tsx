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
  // 详情页入口没有公开设置的表单，板的已保存状态只能从接口取。初值给空对象即可：
  // 生成表单要等 hostIdentState 变成 allowed 才渲染，而那发生在下面这次请求之后
  const [savedPublic, setSavedPublic] = useState<{ public?: number; public_cate?: number }>({});

  useEffect(() => {
    setHostIdentState('checking');
    getDashboard(boardId)
      .then((res) => {
        setSavedPublic({ public: res.public, public_cate: res.public_cate });
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
      <SharingLinkSection
        boardId={boardId}
        hostIdentState={hostIdentState}
        savedPublic={savedPublic}
        onPublicUpdated={() => {
          setSavedPublic({ public: 1, public_cate: 0 });
        }}
      />
    </Modal>
  );
}

export default ModalHOC<IProps>(SharingLinkModal);
