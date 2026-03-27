import { createGlobalState } from 'react-use';
import { IFiremapTimestampSummary, IParamsAiAction } from '../store';

export const useSloTimeRange = createGlobalState<{ start: number; end: number }>();
export const useParamsAiAction = createGlobalState<IParamsAiAction | undefined>();
export const useAiAnalysisStatus = createGlobalState<boolean>(false);
export const useAiAnalysisTime = createGlobalState<{ latestTimestamp: number; timestamp_summary?: IFiremapTimestampSummary }>({ latestTimestamp: 0 }); //全局AI分析需要用的时间戳
