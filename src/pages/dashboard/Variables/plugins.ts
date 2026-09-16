import type { DashboardVariablePlugin } from './pluginTypes';
import { dashboardVariablePlugins as builtinPlugins } from './builtinPlugins';
// @ts-ignore 开源版由 plusResolve 提供空扩展注册表。
import { dashboardVariablePlugins as extensionPlugins } from 'plus:/parcels/Dashboard/variablePlugins';

// Plus 可以扩展公共注册表；同名注册以 Plus 实现为准。
const plugins: Record<string, DashboardVariablePlugin> = { ...builtinPlugins, ...extensionPlugins };

export function getDashboardVariablePlugin(cate?: string): DashboardVariablePlugin | undefined {
  return cate && Object.prototype.hasOwnProperty.call(plugins, cate) ? plugins[cate] : undefined;
}
