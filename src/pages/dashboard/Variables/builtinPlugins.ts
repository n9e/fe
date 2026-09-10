import type { DashboardVariablePlugin } from './pluginTypes';

/** 开源数据源的变量能力在此注册；未注册的数据源继续使用原有流程。 */
export const dashboardVariablePlugins: Record<string, DashboardVariablePlugin> = {};
