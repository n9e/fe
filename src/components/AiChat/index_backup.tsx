import React, { useEffect, useRef, useState, useContext } from 'react';
import { Button, Drawer, Form, message, Modal, Space, Tooltip } from 'antd';
import './style.less';
import { CloseOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PlusOutlined } from '@ant-design/icons';
import IconFont from '@/components/IconFont';
import { useTranslation } from 'react-i18next';
import './locale';
import ChatBox from './ChatBox';
import { matchPath, useLocation } from 'react-router-dom';
import { cleanChat, createChat, getChatHistory, getDataSourceList, getFlashAiDatasource, getMessageHistory, upsertKnowledge } from './services';
import { ApiCreatChat, IFiremapUrlParams, IHistoryItem, IMessageDetail } from './store';
import qs from 'query-string';
import { aiChatWhiteList, EMode, EPageType } from './config';
import { useParamsAiAction } from './utils/useHook';
import { useAiAnalysisTime } from './utils/useHook';
import moment from 'moment';
import { chatBoxScrollToBottom, getMatchRoute, urlOpenAiChat } from './utils/index';
import ChatHistory from './ChatHistory';
import KnowledgeBase from './KnowledgeBase';
import AddKnowledge from './KnowledgeBase/AddKnowledge';
import { handleSubmitCard } from '@/Packages/Outfire/pages/Level2/Alert/RelatedMetric';
import { getAiAnalysisStatus } from '../../Packages/Outfire/services/aiAnalysis';
import { getIdByName } from '../../Packages/Outfire/services';
import { useSloTimeRange } from './utils/useHook';
import DocumentDrawer from '@/components/DocumentDrawer';
import AiBtn from './AiBtn';

/**
 * 要覆盖灭火图卡片详情抽屉的层级. 该抽屉下的所有弹窗都需要设置zIndex
 * @param props
 * @returns
 */
export default function AiChat(props) {
  const { t, i18n } = useTranslation('aiChat');
  const {} = props;

  const location = useLocation();
  const isMatchRoute = getMatchRoute(location.pathname);
  const urlQuery = qs.parse(location.search);
  const isFiremap = [EPageType.FiremapHomepage, EPageType.FiremapFunction, EPageType.FiremapSystem].includes(isMatchRoute?.pageType!);

  // console.log('isMatchRoute', isMatchRoute, location);

  const chatBoxRef = useRef<any>(null);

  const [knowledgeForm] = Form.useForm();

  const [aiAnalysisTime, setAiAnalysisTime] = useAiAnalysisTime();
  const [paramsAiAction, setParamsAiAction] = useParamsAiAction();
  const [sloTimeRange, setSloTimeRange] = useSloTimeRange();

  const [aiAnalysisStatus, setAiAnalysisStatus] = useState<boolean>(false);
  const [fullDrawer, setFullDrawer] = useState(false);
  const [dataSourceList, setDataSourceList] = useState([]);
  const [dataSourceInited, setDataSourceInited] = useState(false);
  const [defaultModel, setDefaultModel] = useState();
  const [mode, setMode] = useState<EMode>(EMode.NewChat);
  const [visible, setVisible] = useState(false);
  const [chatBoxLoading, setChatBoxLoading] = useState<boolean>(false);
  const [chatDetail, setChatDetail] = useState<IMessageDetail>();
  const [messageList, setMessageList] = useState<IMessageDetail[]>([]);
  const [pageInfo, setPageInfo] = useState<ApiCreatChat>();
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [chatHistoryList, setChatHistoryList] = useState<IHistoryItem[]>([]);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);

  const [firemapV2BusinessId, setFiremapV2BusinessId] = useState<number | undefined>(undefined);
  useEffect(() => {
    // 解决灭火图V2 url改造name    params上缺少id的问题
    const needV2BusinessId = [EPageType.FiremapFunction, EPageType.FiremapSystem].includes(isMatchRoute?.pageType!) && !isMatchRoute?.params?.id;
    const layer = urlQuery?.layer as string | undefined;
    const homepage_card = urlQuery?.homepage_card as string | undefined;
    if (needV2BusinessId && layer && homepage_card) {
      getIdByName({ business_group_name: layer, business_name: homepage_card })
        .then((res) => setFiremapV2BusinessId(res?.business_id))
        .catch(() => setFiremapV2BusinessId(undefined));
    } else {
      setFiremapV2BusinessId(undefined);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!!aiAnalysisStatus && isMatchRoute) {
      urlOpenAiChat(urlQuery as any, isMatchRoute, setParamsAiAction, t, aiAnalysisTime);
    }
  }, [aiAnalysisTime, aiAnalysisStatus]);

  useEffect(() => {
    if (isFiremap) {
      if (!!aiAnalysisTime?.timestamp_summary) {
        formatPageInfo();
      }
    } else {
      formatPageInfo();
    }
  }, [location.pathname, aiAnalysisTime, paramsAiAction, sloTimeRange, firemapV2BusinessId]);

  useEffect(() => {
    if (isMatchRoute) {
      if (isFiremap) {
        // 灭火图页面必须等snapshot接口返回后, 有timestamp_summary后, 才能打开AI分析
        if (!!aiAnalysisTime?.timestamp_summary) {
          setMode(EMode.NewChat);
          getAiAnalysisStatus().then((res) => {
            getAiModel();
            setAiAnalysisStatus(res.enable);
            if (res?.enable) {
              initChatHistory(!urlQuery?.firemap_analysis_mode);
            }
          });
        }
      } else {
        setMode(EMode.NewChat);
        getAiAnalysisStatus().then((res) => {
          getAiModel();
          setAiAnalysisStatus(res.enable);
          if (res?.enable) {
            initChatHistory(!urlQuery?.firemap_analysis_mode);
          }
        });
      }
    }
  }, [location.pathname, aiAnalysisTime]);

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
      dataSourceInited
    ) {
      onOpen();
    }
  }, [paramsAiAction, dataSourceInited]);

  const getAiModel = () => {
    if (!isMatchRoute) return;
    getFlashAiDatasource().then((res) => {
      setDataSourceList(res?.items);
      const tempModel = res?.items?.find((item) => item.is_default);
      setDefaultModel(tempModel || res?.items?.[0]);
      setDataSourceInited(true);
    });
  };

  const formatPageInfo = () => {
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
        param = {
          workspace_id: Number(sessionStorage.getItem('spaceId')),
          business_id: Number(isMatchRoute?.params?.id) || firemapV2BusinessId!,
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

  const initChatHistory = (isInit?: boolean) => {
    if (!isMatchRoute) return;

    setHistoryLoading(true);
    getChatHistory()
      .then((res) => {
        // console.log('res', res, isMatchRoute);

        setChatHistoryList(res);
        if (isInit) {
          const temp = res?.find((el) => {
            const firemapType = [EPageType.FiremapHomepage, EPageType.FiremapFunction, EPageType.FiremapLevel2, EPageType.FiremapSystem];
            const sloType = [EPageType.SloList, EPageType.SloDetail];
            const pageTypeArr = firemapType.includes(isMatchRoute?.pageType) ? firemapType : [isMatchRoute?.pageType];

            if (isMatchRoute?.pageType === EPageType.SloDetail) {
              // slo必须id一致才展示历史消息
              const sloId = Number(isMatchRoute?.params?.id);
              return el.page_from.param.slo.id === sloId;
            } else {
              return pageTypeArr.includes(el.page_from.page);
            }
          });

          if (temp) {
            const is2hBefore = moment(temp.last_update, 'X').isBefore(moment().subtract(2, 'hours'));
            // console.log('is2hBefore', is2hBefore);
            if (!is2hBefore) {
              getMessageList(temp.chat_id, temp.seq_id);
            }
          }
        }
      })
      .finally(() => {
        setHistoryLoading(false);
      });
  };

  const createNewChat = () => {
    if (!isMatchRoute || !dataSourceList?.length || !pageInfo) return;

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

  const onOpen = () => {
    setVisible(true);
    if (mode === EMode.NewChat || !!paramsAiAction?.firemap || !!paramsAiAction?.slo) {
      createNewChat();
    }
  };

  const onClose = () => {
    if ([EMode.KnowledgeBaseAdd, EMode.KnowledgeBaseEdit].includes(mode) && isFormEdit) {
      Modal.confirm({
        title: t('closeTips'),
        zIndex: 1001,
        onOk: () => {
          setIsFormEdit(false);
          setVisible(false);
        },
      });
    } else {
      setVisible(false);
    }
  };

  const getMessageList = (chat_id: string, seq_id?: number) => {
    getMessageHistory({ chat_id, seq_id }).then((res) => {
      setMessageList(res);
      setMode(EMode.CurrentChat);
      chatBoxScrollToBottom();
    });
  };

  const modeChange = (newMode: EMode, data?: { chat_id: string; seq_id?: number }) => {
    if ([EMode.KnowledgeBaseAdd, EMode.KnowledgeBaseEdit].includes(mode) && isFormEdit) {
      Modal.confirm({
        title: t('closeTips'),
        zIndex: 1001,
        onOk: () => {
          setIsFormEdit(false);
          setMode(newMode);
        },
      });
    } else if (newMode === EMode.NewChat) {
      setMode(newMode);
      createNewChat();
    } else if (newMode === EMode.CurrentChat && !!data) {
      getMessageList(data.chat_id, data.seq_id);
    } else if (newMode === EMode.ChatHistory) {
      setMode(newMode);
      initChatHistory();
    } else {
      setMode(newMode);
    }
  };

  const knowledgeSave = () => {
    knowledgeForm.validateFields().then((values) => {
      setConfirmLoading(true);
      const data = {
        ...values,
        firemap: handleSubmitCard(values.firemap),
      };
      upsertKnowledge(data)
        .then((res) => {
          message.success(t('saveSuccess'));
          setIsFormEdit(false);
          // modeChange(EMode.KnowledgeBase);
          setMode(EMode.KnowledgeBase);
        })
        .finally(() => {
          setConfirmLoading(false);
        });
    });
  };

  const getTitle = () => {
    let res;

    switch (mode) {
      case EMode.KnowledgeBaseAdd:
        res = t('header.addKnowledge');
        break;
      case EMode.KnowledgeBaseEdit:
        res = t('header.editKnowledge');
        break;
      default:
        res = 'FlashAI';
    }
    return res;
  };

  return !isMatchRoute || !aiAnalysisStatus ? null : (
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
        title={
          <>
            <div className='drawer-title-left'>
              <div
                className='drawer-full-icon'
                onClick={() => {
                  setFullScreenVisible(false);
                  setFullDrawer(!fullDrawer);
                }}
              >
                <Tooltip
                  title={fullDrawer ? t('header.foldScreen') : t('header.fullScreen')}
                  visible={fullScreenVisible}
                  onVisibleChange={(v) => {
                    setFullScreenVisible(v);
                  }}
                >
                  {!fullDrawer ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                </Tooltip>
              </div>
              <div className='title-text'>
                {getTitle()}
                <Button
                  type='link'
                  icon={<IconFont type='icon-ic_book_one' />}
                  onClick={() =>
                    DocumentDrawer({
                      zIndex: 1002,
                      title: t('common:page_help'),
                      type: 'iframe',
                      documentPath: mode === 'knowledge_base' ? '/docs/content/flashcat/flashai/what-is-knowledge-base/' : '/docs/content/flashcat/flashai/what-is-flashai/',
                    })
                  }
                >
                  {t('translation:说明文档')}
                </Button>
              </div>
            </div>
            <div className='drawer-title-right'>
              <Space size={8}>
                {/* <Button
                  type='text'
                  size='small'
                  style={{ height: '22px' }}
                  onClick={() => {
                    cleanChat();
                  }}
                >
                  测试用清空会话历史
                </Button> */}
                {![EMode.CurrentChat, EMode.NewChat].includes(mode) && (
                  <Button
                    type='primary'
                    size='small'
                    style={{ height: '22px' }}
                    onClick={() => {
                      modeChange(messageList?.length > 0 ? EMode.CurrentChat : EMode.NewChat);
                    }}
                  >
                    {t('header.currentSession')}
                  </Button>
                )}
                <Tooltip title={t('header.newIcon')}>
                  <Button
                    type='text'
                    size='small'
                    onClick={() => {
                      modeChange(EMode.NewChat);
                    }}
                    icon={<PlusOutlined />}
                  />
                </Tooltip>
                <Tooltip title={t('header.historyIcon')}>
                  <Button
                    type='text'
                    size='small'
                    onClick={() => {
                      modeChange(EMode.ChatHistory);
                    }}
                    icon={<IconFont type='icon-ic_chat_history' />}
                  />
                </Tooltip>
                <Tooltip title={t('header.knowledgeIcon')}>
                  <Button
                    type='text'
                    size='small'
                    onClick={() => {
                      modeChange(EMode.KnowledgeBase);
                    }}
                    icon={<IconFont type='icon-ic_knowledge_base' />}
                  />
                </Tooltip>
                <Tooltip title={t('header.close')}>
                  <Button type='text' size='small' onClick={onClose} icon={<CloseOutlined />} />
                </Tooltip>
              </Space>
            </div>
          </>
        }
        closable={false}
        footer={
          [EMode.KnowledgeBaseAdd, EMode.KnowledgeBaseEdit].includes(mode) ? (
            <Space>
              <Button
                type='primary'
                onClick={() => {
                  knowledgeSave();
                }}
                loading={confirmLoading}
              >
                {t('confirm')}
              </Button>
              <Button
                onClick={() => {
                  modeChange(EMode.KnowledgeBase);
                }}
              >
                {t('cancel')}
              </Button>
            </Space>
          ) : null
        }
      >
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
          />
        )}
        {/* {mode === EMode.ChatHistory && (
          <ChatHistory modeChange={modeChange} chatHistoryList={chatHistoryList} setChatHistoryList={setChatHistoryList} historyLoading={historyLoading} />
        )}
        {mode === EMode.KnowledgeBase && <KnowledgeBase modeChange={modeChange} knowledgeForm={knowledgeForm} />}
        {[EMode.KnowledgeBaseAdd, EMode.KnowledgeBaseEdit].includes(mode) && <AddKnowledge knowledgeForm={knowledgeForm} setIsFormEdit={setIsFormEdit} />} */}
      </Drawer>
    </>
  );
}
