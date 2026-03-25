import React, { useEffect, useRef, useState } from 'react';
import Header from './Header';
import ChatBox from '../ChatBox';
import ChatHistory from '../ChatHistory';
import KnowledgeBase from '../KnowledgeBase';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { chatBoxScrollToBottom, urlOpenAiChat } from '../utils';
import { EMode, EPageType } from '../config';
import { useSloTimeRange, useParamsAiAction, useAiAnalysisTime } from '../utils/useHook';
import { ApiCreatChat, ICustomMessageRenderer, IHiddenFeature, IMessageDetail } from '../store';
import { createChat, getChatHistory, getMessageHistory } from '../services';
import moment from 'moment';
import { getIdByName } from '@/Packages/Outfire/services';
import { IUseAiInit, useAiInit } from '../utils/useAiInit';
import qs from 'query-string';
import './style.less';

interface IProps {
  aiInit: IUseAiInit;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fullDrawer: boolean;
  setFullDrawer: (fullDrawer: boolean) => void;
  hiddenFeature?: IHiddenFeature;
  createNew?: boolean;
  customMessageRenderer?: React.ComponentType<ICustomMessageRenderer>;
}

export default function ChatContent(props: IProps) {
  const { t, i18n } = useTranslation('aiChat');
  const { aiInit, visible, setVisible, fullDrawer, setFullDrawer, hiddenFeature, customMessageRenderer, createNew } = props;
  const { isMatchRoute, isFiremap, dataSourceList, aiStatus } = aiInit;
  const location = useLocation();
  const urlQuery = qs.parse(location.search);

  const chatBoxRef = useRef<any>(null);

  const [aiAnalysisTime, setAiAnalysisTime] = useAiAnalysisTime();
  const [paramsAiAction, setParamsAiAction] = useParamsAiAction();
  const [sloTimeRange, setSloTimeRange] = useSloTimeRange();

  const [mode, setMode] = useState<EMode>(EMode.NewChat);
  const [chatBoxLoading, setChatBoxLoading] = useState<boolean>(false);
  const [chatDetail, setChatDetail] = useState<IMessageDetail>();
  const [messageList, setMessageList] = useState<IMessageDetail[]>([]);
  const [pageInfo, setPageInfo] = useState<ApiCreatChat>();

  useEffect(() => {
    if (isFiremap) {
      if (!!aiAnalysisTime?.timestamp_summary) {
        formatPageInfo();
      }
    } else {
      formatPageInfo();
    }
  }, [location.pathname, aiAnalysisTime, paramsAiAction, sloTimeRange]);

  useEffect(() => {
    if (!visible || !aiStatus.aiReady || !pageInfo) return;

    let cancelled = false;

    const initSession = async () => {
      setMode(EMode.NewChat);

      const shouldForceNew = !!createNew || !!paramsAiAction?.firemap || !!paramsAiAction?.slo;

      if (!shouldForceNew && !urlQuery?.firemap_analysis_mode) {
        setChatBoxLoading(true);
        const restored = await tryRestoreLatestSession();
        setChatBoxLoading(false);
        if (cancelled || restored) return;
      }

      if (pageInfo) {
        createNewChat();
      }
    };

    initSession();

    return () => {
      cancelled = true;
    };
  }, [visible, aiStatus.aiReady, createNew, pageInfo]);

  const tryRestoreLatestSession = async (): Promise<boolean> => {
    const res = await getChatHistory();

    const temp = res?.[0];

    if (temp) {
      const is2hBefore = moment(temp.last_update, 'X').isBefore(moment().subtract(2, 'hours'));
      if (!is2hBefore) {
        const messages = await getMessageHistory({ chat_id: temp.chat_id, seq_id: temp.seq_id });
        setMessageList(messages);
        setMode(EMode.CurrentChat);
        chatBoxScrollToBottom();
        return true;
      }
    }

    return false;
  };

  const formatPageInfo = async () => {
    if (!isMatchRoute) {
      return;
    }

    let param: ApiCreatChat['param'];
    switch (isMatchRoute?.pageType) {
      case EPageType.FiremapHomepage:
        param = {
          workspace_id: Number(sessionStorage.getItem('spaceId')),
          timestamp: aiAnalysisTime?.latestTimestamp || moment().unix(),
          firemap_timestamp_summary: aiAnalysisTime?.timestamp_summary,
        };
        break;
      case EPageType.FiremapFunction:
      case EPageType.FiremapSystem:
        // 解决灭火图V2 url改造name    params上缺少id的问题
        let firemapV2BusinessId = isMatchRoute?.params?.id;
        const layer = urlQuery?.layer as string | undefined;
        const homepage_card = urlQuery?.homepage_card as string | undefined;
        if (!firemapV2BusinessId && layer && homepage_card) {
          const res = await getIdByName({ business_group_name: layer, business_name: homepage_card });
          firemapV2BusinessId = res?.business_id;
        }
        param = {
          workspace_id: Number(sessionStorage.getItem('spaceId')),
          business_id: firemapV2BusinessId!,
          timestamp: aiAnalysisTime?.latestTimestamp || moment().unix(),
          firemap_timestamp_summary: aiAnalysisTime?.timestamp_summary,
        };
        break;
      case EPageType.Dashboards:
        param = {
          dashboard: {
            ...paramsAiAction?.dashboard,
            id: isMatchRoute?.params?.id || 0,
          },
        };
        break;
      case EPageType.AlertActive:
        param = {
          active_alert: paramsAiAction?.active_alert,
        };
        break;

      case EPageType.SloList:
        param = {
          slo: {
            workspace_id: Number(sessionStorage.getItem('spaceId')),
          },
        };
        break;

      case EPageType.SloDetail:
        param = {
          slo: {
            workspace_id: Number(sessionStorage.getItem('spaceId')),
            id: Number(isMatchRoute?.params?.id),
            start: sloTimeRange?.start,
            end: sloTimeRange?.end,
          },
        };
        break;
      default:
        param = {};
    }
    const obj = {
      page: isMatchRoute?.pageType,
      param,
    };
    // console.log('obj', obj);

    setPageInfo(obj);
  };

  const createNewChat = () => {
    if (!aiStatus.aiReady || !pageInfo) return;

    setMessageList([]);
    setChatDetail(undefined);
    setChatBoxLoading(true);
    createChat(pageInfo)
      .then((res) => {
        setChatDetail(res);

        const firemapAiAction = paramsAiAction?.firemap;
        const sloAiAction = paramsAiAction?.slo;
        // console.log('firemapAiAction', firemapAiAction);
        if (!!firemapAiAction) {
          // 灭火图新会话, 直接发送信息
          setMode(EMode.CurrentChat);
          chatBoxRef.current?.userSendMessage({ content: firemapAiAction.content, ...firemapAiAction.action });
          setParamsAiAction({ ...paramsAiAction, firemap: undefined });
        } else if (!!sloAiAction) {
          setMode(EMode.CurrentChat);
          chatBoxRef.current?.userSendMessage({ content: sloAiAction.content, ...sloAiAction.action });
          setParamsAiAction({ ...paramsAiAction, slo: undefined });
        }
      })
      .finally(() => {
        setChatBoxLoading(false);
      });
  };

  const onClose = () => {
    setVisible(false);
  };

  const getMessageList = (chat_id: string, seq_id?: number) => {
    getMessageHistory({ chat_id, seq_id }).then((res) => {
      setMessageList(res);
      setMode(EMode.CurrentChat);
      chatBoxScrollToBottom();
    });
  };

  const modeChange = (newMode: EMode, data?: { chat_id: string; seq_id?: number }) => {
    if ([EMode.KnowledgeBaseAdd, EMode.KnowledgeBaseEdit].includes(mode)) {
      setMode(newMode);
    } else if (newMode === EMode.NewChat) {
      setMode(newMode);
      createNewChat();
    } else if (newMode === EMode.CurrentChat && !!data) {
      getMessageList(data.chat_id, data.seq_id);
    } else if (newMode === EMode.ChatHistory) {
      setMode(newMode);
    } else {
      setMode(newMode);
    }
  };

  return (
    <div className='ai-chat-container'>
      <Header mode={mode} onClose={onClose} fullDrawer={fullDrawer} setFullDrawer={setFullDrawer} modeChange={modeChange} messageList={messageList} hiddenFeature={hiddenFeature} />

      {[EMode.CurrentChat, EMode.NewChat].includes(mode) && (
        <ChatBox
          ref={chatBoxRef}
          dataSourceList={dataSourceList}
          chatDetail={chatDetail}
          pageInfo={pageInfo}
          messageList={messageList}
          setMessageList={setMessageList}
          mode={mode}
          chatBoxLoading={chatBoxLoading}
          hiddenFeature={hiddenFeature}
          customMessageRenderer={customMessageRenderer}
        />
      )}
      {mode === EMode.ChatHistory && <ChatHistory modeChange={modeChange} isMatchRoute={isMatchRoute} />}
      {mode === EMode.KnowledgeBase && <KnowledgeBase mode={mode} modeChange={modeChange} />}
    </div>
  );
}
