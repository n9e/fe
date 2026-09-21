import _ from 'lodash';

/**
 * 原生对接的媒介：request_type 与 ident 同名，后端 provider 自己组包、自管成功判定。
 * 与后端 models.IsNativeRequestType 保持一致。
 *
 * 这类媒介在官网还没有文档页，右侧文档面板走仓库内的本地文档（按 request_type 组织），
 * 否则 iframe 会渲染一张带营销 banner 的 404 页。
 */
export const NATIVE_REQUEST_TYPES = ['jira'];

export function isNativeRequestType(requestType?: string): boolean {
  return _.includes(NATIVE_REQUEST_TYPES, requestType);
}
