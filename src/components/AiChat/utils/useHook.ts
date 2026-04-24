import { createGlobalState } from 'react-use';
import { IFiremapTimestampSummary, IMessageDetail, IParamsAiAction } from '../store';

export const useAiChatVisible = createGlobalState<boolean>(false);
export const useChatData = createGlobalState<{ chatDetail?: IMessageDetail; messageList: IMessageDetail[] }>({ chatDetail: undefined, messageList: [] });

/**
 * 只用来处理某些页面的独立事件
 * 例如：点击某个按钮，需要在ai消息内触发交互
 */
export const useAiHandleEvent = createGlobalState<{ onExecuteQueryForQueryContent?: Function } | undefined>();

/**
 * 后续一些用户偏好，放在这个state里
 * 例如：云端助理是否开启、当前选中的模型
 */
export const useAiUserPrefs = createGlobalState<{ cloud_assitant: boolean; selectedModel?: any }>({ cloud_assitant: false, selectedModel: undefined });

/**
 * 外部业务方注入的配置数据（不是用户偏好）
 * 由 AiChat 入口接收 props 后写入，供深层组件按需读取
 */
export const useAiExternalConfig = createGlobalState<{
  promptList?: string[];
  // 未来还有别的外部配置都加这里
}>({});

export const useSloTimeRange = createGlobalState<{ start: number; end: number }>();
export const useParamsAiAction = createGlobalState<IParamsAiAction | undefined>();
export const useAiAnalysisTime = createGlobalState<{ latestTimestamp: number; timestamp_summary?: IFiremapTimestampSummary }>({ latestTimestamp: 0 }); //全局AI分析需要用的时间戳
