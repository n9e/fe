import type { IRawTimeRange } from '@/components/TimeRangePicker/types';
import type { JsonObject, ScopedVariables } from '../types';
import type { IVariable } from './types';

export interface VariableCapabilities {
  multi: boolean;
  all: boolean;
  allValuePlaceholder?: string;
}

export interface QueryVariableContext {
  variables: IVariable[];
  range?: IRawTimeRange;
  step?: number;
  scopedVars?: ScopedVariables;
}

export interface DashboardVariablePlugin {
  capabilities: (query?: JsonObject) => VariableCapabilities;
  /**
   * undefined 表示依赖尚未就绪；返回的查询不再进行通用插值。
   * 用户可修正的查询校验错误应抛出，以便调用方显示错误而不是静默跳过 target。
   */
  transformQuery: (query: JsonObject, context: QueryVariableContext) => JsonObject | undefined;
}
