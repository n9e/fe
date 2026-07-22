import _ from 'lodash';

/** 与后端 center/router/agentassets/install-categraf.sh.tmpl 的参数名保持一致 */
export const INSTALL_SCRIPT_PATH = '/api/n9e/agents/categraf/install.sh';

/** 补协议、去尾斜杠；返回空串表示输入不可用 */
export function normalizeServerAddr(input?: string): string {
  const raw = _.trim(input ?? '');
  if (!raw) return '';
  // 已带协议就保留（支持 https 与非标端口）；未带则跟随当前页面协议，
  // 避免在 https 页面上拼出 http 让用户困惑
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `${window.location.protocol || 'http:'}//${raw}`;
  return _.trimEnd(withProtocol, '/');
}

export function isValidServerAddr(input?: string): boolean {
  const addr = normalizeServerAddr(input);
  if (!addr) return false;
  try {
    return !!new URL(addr).hostname;
  } catch {
    return false;
  }
}

/** 单引号强引用，防止地址或密码里的特殊字符破坏命令 */
function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

interface BuildCommandOptions {
  serverAddr: string;
  basicAuthUser?: string;
  basicAuthPass?: string;
}

/** 产出 curl 的 -u 片段与安装脚本的 --auth 参数；未填用户名则均为空串 */
function buildAuthParts(options: BuildCommandOptions): { curlAuth: string; authArg: string } {
  const user = _.trim(options.basicAuthUser ?? '');
  const pass = options.basicAuthPass ?? '';
  if (!user) return { curlAuth: '', authArg: '' };
  // 拉取脚本本身也可能需要 basic auth
  const cred = shellQuote(`${user}:${pass}`);
  return { curlAuth: ` -u ${cred}`, authArg: ` --auth ${cred}` };
}

/**
 * 拼出一键安装命令。
 * 必须是 `bash -s --` 形式：`| sudo bash --force` 会把参数吃掉而不报错。
 */
export function buildInstallCommand(options: BuildCommandOptions): string {
  const addr = normalizeServerAddr(options.serverAddr);
  if (!addr) return '';
  const { curlAuth, authArg } = buildAuthParts(options);
  return `curl -sSfL${curlAuth} ${shellQuote(`${addr}${INSTALL_SCRIPT_PATH}`)} | sudo bash -s -- --server ${shellQuote(addr)}${authArg}`;
}

/** 不放心直接 pipe 到 bash 的用户，可以先下载审阅再执行 */
export function buildManualCommand(options: BuildCommandOptions): string {
  const addr = normalizeServerAddr(options.serverAddr);
  if (!addr) return '';
  const { curlAuth, authArg } = buildAuthParts(options);
  return `curl -sSfL${curlAuth} ${shellQuote(`${addr}${INSTALL_SCRIPT_PATH}`)} -o install-categraf.sh\nless install-categraf.sh\nsudo bash install-categraf.sh --server ${shellQuote(addr)}${authArg}`;
}
