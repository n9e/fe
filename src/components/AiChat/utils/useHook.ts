import { createGlobalState } from 'react-use';
import { IFiremapTimestampSummary, IMessageDetail, IParamsAiAction } from '../store';

export const useChatData = createGlobalState<{ chatDetail?: IMessageDetail; messageList: IMessageDetail[] }>({ chatDetail: undefined, messageList: [] });

export const useAiChatVisible = createGlobalState<boolean>(false);
export const useSloTimeRange = createGlobalState<{ start: number; end: number }>();
export const useParamsAiAction = createGlobalState<IParamsAiAction | undefined>();
export const useAiAnalysisTime = createGlobalState<{ latestTimestamp: number; timestamp_summary?: IFiremapTimestampSummary }>({ latestTimestamp: 0 }); //全局AI分析需要用的时间戳
