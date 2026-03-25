import React, { useEffect, useRef, useState, useContext } from 'react';
import { Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import './locale';
import { useLocation } from 'react-router-dom';
import { EPageType } from './config';
import { urlOpenAiChat } from './utils/index';
import { useParamsAiAction, useAiAnalysisTime } from './utils/useHook';
import AiBtn from './AiBtn';
import ChatContent from './ChatContent';
import { useAiInit } from './utils/useAiInit';
import './style.less';

/**
 * 要覆盖灭火图卡片详情抽屉的层级. 该抽屉下的所有弹窗都需要设置zIndex
 * @param props
 * @returns
 */
export default function AiChat(props) {
  const { t, i18n } = useTranslation('aiChat');
  const {} = props;

  const location = useLocation();
  const aiInit = useAiInit();
  const { isMatchRoute, urlQuery, aiStatus } = aiInit;

  const [paramsAiAction, setParamsAiAction] = useParamsAiAction();
  const [aiAnalysisTime, setAiAnalysisTime] = useAiAnalysisTime();

  const [fullDrawer, setFullDrawer] = useState(false);
  const [visible, setVisible] = useState(false);
  const [createNew, setCreateNew] = useState(false);

  useEffect(() => {
    if (!!aiStatus.aiStatusEnable && isMatchRoute) {
      urlOpenAiChat(urlQuery as any, isMatchRoute, setParamsAiAction, t, aiAnalysisTime);
    }
  }, [aiAnalysisTime, aiStatus.aiStatusEnable]);

  useEffect(() => {
    /**
     * 灭火图卡片上 和 slo列表页 快捷打开AI分析的抽屉
     * 1. 灭火图卡片上AI分析按钮快捷打开
     * 2. 灭火图通过url打开
     * 3. slo列表页 AI巡检 按钮快捷打开
     * 4. slo列表页 通过url打开
     */
    if (
      paramsAiAction?.page &&
      [EPageType.FiremapHomepage, EPageType.FiremapLevel2, EPageType.FiremapFunction, EPageType.FiremapSystem, EPageType.SloList].includes(paramsAiAction?.page) &&
      (!!paramsAiAction?.firemap || !!paramsAiAction?.slo) &&
      !!aiStatus.aiReady
    ) {
      onOpen();
      setCreateNew(true);
    }
  }, [paramsAiAction, aiStatus.aiReady]);

  const onOpen = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
    setCreateNew(false);
  };

  return !isMatchRoute || !aiStatus.aiStatusEnable ? null : (
    <>
      <AiBtn onOpen={onOpen} />

      <Drawer
        visible={visible}
        onClose={onClose}
        width={fullDrawer ? '100%' : '60%'}
        zIndex={1001} // 要覆盖详情抽屉的zIndex
        className='ai-chat-drawer'
        getContainer={() => document.body}
        destroyOnClose={true}
        closable={false}
        title={false} // 不用 Drawer 自带 header
        footer={false}
      >
        <ChatContent
          aiInit={aiInit}
          visible={visible}
          setVisible={setVisible}
          fullDrawer={fullDrawer}
          setFullDrawer={setFullDrawer}
          createNew={createNew}
          hiddenFeature={{
            // fullScreen: true,
            knowledgeBase: false,
            chatHistory: false,
            // closeIcon: true,
          }}
        />
      </Drawer>
    </>
  );
}
