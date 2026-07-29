import _ from 'lodash';

import { normalizeServerAddr, shellQuote } from '../InstallCategraf/buildCommand';

/** 与后端 center/router/agentassets/collect-config.sh 的参数名保持一致 */
export const COLLECT_SCRIPT_PATH = '/api/n9e/agents/categraf/collect.sh';

/**
 * toml 内容进 base64：一是避开引号/换行的转义地狱，二是密码不至于裸在命令里。
 * btoa 只吃 Latin-1，中文 labels 会抛 InvalidCharacterError，所以先过 TextEncoder。
 */
export function toBase64(content: string): string {
  const bytes = new TextEncoder().encode(content);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export interface BuildCollectCommandOptions {
  serverAddr: string;
  basicAuthUser?: string;
  basicAuthPass?: string;
  /** categraf 插件名 */
  input: string;
  /** 完整插件配置内容 */
  toml: string;
}

/** 拉取脚本本身可能需要 basic auth；脚本执行不回连服务端，所以只有 curl 侧需要凭据 */
function buildCurlAuth(options: BuildCollectCommandOptions): string {
  const user = _.trim(options.basicAuthUser ?? '');
  if (!user) return '';
  return ` -u ${shellQuote(`${user}:${options.basicAuthPass ?? ''}`)}`;
}

/**
 * 拼出一键配置采集命令。与安装命令同构：
 * 必须是 `bash -s --` 形式，`| sudo bash --input x` 会把参数吃掉而不报错。
 */
export function buildCollectCommand(options: BuildCollectCommandOptions): string {
  const addr = normalizeServerAddr(options.serverAddr);
  if (!addr || !_.trim(options.toml)) return '';
  const conf = shellQuote(toBase64(options.toml));
  return `curl -sSfL${buildCurlAuth(options)} ${shellQuote(`${addr}${COLLECT_SCRIPT_PATH}`)} | sudo bash -s -- --input ${shellQuote(options.input)} --conf-b64 ${conf}`;
}

/** 不放心直接 pipe 到 bash 的用户，可以先下载审阅再执行 */
export function buildManualCollectCommand(options: BuildCollectCommandOptions): string {
  const addr = normalizeServerAddr(options.serverAddr);
  if (!addr || !_.trim(options.toml)) return '';
  const conf = shellQuote(toBase64(options.toml));
  return [
    `curl -sSfL${buildCurlAuth(options)} ${shellQuote(`${addr}${COLLECT_SCRIPT_PATH}`)} -o collect-config.sh`,
    'less collect-config.sh',
    `sudo bash collect-config.sh --input ${shellQuote(options.input)} --conf-b64 ${conf}`,
  ].join('\n');
}
