import { useEffect, useRef, useCallback, useState } from 'react';
import { matchPath } from 'react-router-dom';
import { aiChatWhiteList, EPageType } from '../config';
import { EActionKey, EFiremapAnalysisMode, IFiremapUrlParams, IMatchRoute, IParamsAiAction, ISloUrlParams } from '../store';

export function getMatchRoute(pathname: string): IMatchRoute | undefined {
  let resRoute;
  aiChatWhiteList.find((item) => {
    const matchRoute: any = matchPath(pathname, { path: item.path, exact: true });
    if (matchRoute) {
      resRoute = {
        ...matchRoute,
        pageType: item.pageType !== EPageType.FiremapLevel2 ? item.pageType : matchRoute?.params?.type === 'system' ? EPageType.FiremapSystem : EPageType.FiremapFunction,
      };
    }
    return matchRoute;
  });

  return resRoute;
}

export function useAutoScroll(containerRef: React.RefObject<HTMLElement>) {
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const frameRef = useRef<number>();
  const THRESHOLD = 50;

  // 判断是否在底部
  const isNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return false;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= THRESHOLD;
  }, [containerRef]);

  // 手动滚到底部（立即跳，不用 smooth，防止 conflict）
  const scrollToBottom = useCallback(
    (type?: 'smooth' | 'immediate') => {
      const el = containerRef.current;
      if (!el) return;
      cancelAnimationFrame(frameRef.current!);
      if (type === 'smooth') {
        el.scrollTo({ top: el.scrollHeight - el.clientHeight, behavior: 'smooth' });
      } else {
        frameRef.current = requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight - el.clientHeight;
        });
      }
    },
    [containerRef],
  );

  // 尝试滚动（只在自动滚动开启 + 视图接近底部时）
  const maybeScrollToBottom = useCallback(
    (type?: 'smooth' | 'immediate') => {
      if (!autoScrollEnabled) return;
      if (isNearBottom()) {
        scrollToBottom(type);
      }
    },
    [autoScrollEnabled, isNearBottom, scrollToBottom],
  );

  // 监听用户滚动
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (isNearBottom()) {
        setAutoScrollEnabled(true);
      } else {
        setAutoScrollEnabled(false);
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [isNearBottom]);

  return {
    maybeScrollToBottom,
    scrollToBottom,
    autoScrollEnabled,
    setAutoScrollEnabled,
  };
}

export function chatBoxScrollToBottom() {
  setTimeout(() => {
    const div = document.querySelector('.ai-chat-content .chat-box');

    if (div) {
      div.scrollTo({ top: div.scrollHeight - div.clientHeight, behavior: 'smooth' });
    }
  }, 100);
}

/**
 * 通过url打开aiChat
 * 支持的页面
 * 1. 灭火图
 * 2. SLO列表页
 *
 * @param urlQuery 灭火图url参数
 * @param isMatchRoute 灭火图路由
 * @param setFiremapAiAction 设置灭火图aiAction
 * @param t 翻译
 * @param aiAnalysisTime 灭火图时间戳, 灭火图页面需要
 */
export function urlOpenAiChat(
  urlQuery: IFiremapUrlParams | ISloUrlParams,
  isMatchRoute: IMatchRoute,
  setParamsAiAction: (params: IParamsAiAction) => void,
  t: any,
  aiAnalysisTime?,
) {
  if (
    [EPageType.FiremapHomepage, EPageType.FiremapLevel2, EPageType.FiremapFunction, EPageType.FiremapSystem].includes(isMatchRoute?.pageType) &&
    aiAnalysisTime?.timestamp_summary
  ) {
    firemapUrlOpenAiChat(urlQuery as IFiremapUrlParams, isMatchRoute, setParamsAiAction, t);
  } else if ([EPageType.SloList].includes(isMatchRoute?.pageType)) {
    sloUrlOpenAiChat(urlQuery as ISloUrlParams, isMatchRoute, setParamsAiAction, t);
  }
}

/**
 * 灭火图通过url打开aiChat
 * 参考链接: http://10.99.1.106:9000/firemap/function/13406?aiBusinessId=13406&aiCardName=card123&firemap_analysis_mode=group&spaceId=3207034051178&time=1752206340&aiGroupId=30478&aiCardId=76625
 *
 * @param urlQuery 灭火图url参数
 * @param isMatchRoute 灭火图路由
 * @param setFiremapAiAction 设置灭火图aiAction
 * @param t 翻译
 */
export function firemapUrlOpenAiChat(urlQuery: IFiremapUrlParams, isMatchRoute: IMatchRoute, setParamsAiAction: (params: IParamsAiAction) => void, t: any) {
  // console.log('urlQuery', urlQuery, isMatchRoute);
  const { firemap_analysis_mode, spaceId, time, aiBusinessId, aiGroupId, aiCardId, aiCardName } = urlQuery as unknown as IFiremapUrlParams;
  // url传参直接打开抽屉并分析
  if (!!firemap_analysis_mode && isMatchRoute) {
    let obj;
    if (isMatchRoute?.pageType === EPageType.FiremapHomepage && [EFiremapAnalysisMode.Global, EFiremapAnalysisMode.Business].includes(firemap_analysis_mode)) {
      obj = {
        content: t('分析') + ` ${aiCardName || t('当前页面')} ` + t('异常原因'),
        action: {
          key: EActionKey.FiremapGlobalAnalysis,
          param: {
            firemap_analysis_mode,
            workspace_id: Number(spaceId),
            timestamp: Number(time),
            business_id: aiBusinessId ? Number(aiBusinessId) : undefined,
          },
        },
      };
    } else if (
      [EPageType.FiremapFunction, EPageType.FiremapSystem].includes(isMatchRoute?.pageType) &&
      [EFiremapAnalysisMode.Card, EFiremapAnalysisMode.Group].includes(firemap_analysis_mode)
    ) {
      obj = {
        content: t('分析') + ` ${aiCardName} ` + t('异常原因'),
        action: {
          key: firemap_analysis_mode === EFiremapAnalysisMode.Card ? EActionKey.FiremapCardAnalysis : EActionKey.FiremapGlobalAnalysis,
          param: {
            firemap_analysis_mode,
            workspace_id: Number(spaceId),
            timestamp: Number(time),
            group_id: Number(aiGroupId),
            business_id: Number(aiBusinessId),
            card_id: Number(aiCardId),
          },
        },
      };
    }
    setParamsAiAction({
      page: isMatchRoute?.pageType,
      firemap: obj,
    });
  }
}

/**
 * 灭火图通过url打开aiChat
 * 参考链接: http://10.99.1.106:9000/firemap/slo?spaceId=3207034051178&ai_analysis_mode=slo_inspection&sloName=电商系统&sloId=5322806507114
 * @param urlQuery SLO列表页的url参数
 * @param isMatchRoute 灭火图路由
 * @param setFiremapAiAction 设置灭火图aiAction
 * @param t 翻译
 */
export function sloUrlOpenAiChat(urlQuery: ISloUrlParams, isMatchRoute: IMatchRoute, setParamsAiAction: (params: IParamsAiAction) => void, t: any) {
  const { ai_analysis_mode, sloId, sloName } = urlQuery as unknown as ISloUrlParams;
  // url传参直接打开抽屉并分析
  if (!!ai_analysis_mode && isMatchRoute) {
    setParamsAiAction({
      page: EPageType.SloList,
      slo: {
        content: t('巡检') + ` ${sloName}`,
        action: {
          key: EActionKey.SloInspection,
          param: {
            slo_id: Number(sloId),
          },
        },
      },
    });
  }
}
