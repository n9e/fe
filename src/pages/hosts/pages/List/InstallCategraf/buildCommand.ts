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

/**
 * 选出「被监控机器该上报到哪」的默认地址。
 *
 * meta.base_url 是服务端从请求头推导的，反代下常常不可靠：nginx 最常见的那段
 * `proxy_set_header Host $host` 会把端口吃掉（`$http_host` 才带端口），
 * `X-Forwarded-Proto` 漏配则会把 https 推成 http。于是 https://n9e.example.com:10443
 * 被推成 https://n9e.example.com，装机命令里的地址全少一截。
 *
 * 浏览器地址栏永远带着真实协议与端口，所以同一台机器（hostname 相同）上以浏览器
 * 为准，只借用它的 protocol + host，保留 base_url 自己的子路径（反代子路径部署
 * 如 /n9e，origin 里是没有的）。hostname 不同则说明服务端推出来的是另一个对外
 * 地址，原样保留。
 *
 * 只订正 base_url：它是「推」出来的，可能错。site_url 是管理员在站点设置里一个字
 * 一个字敲进去的，端口写成什么就是什么，拿浏览器地址去改写它是越权。
 */
export function pickDefaultServerAddr(options: { metaBaseURL?: string; siteURL?: string; origin?: string }): string {
  const origin = normalizeServerAddr(options.origin);
  const derived = normalizeServerAddr(options.metaBaseURL);
  if (!derived) return normalizeServerAddr(options.siteURL) || origin;
  if (!origin || derived === origin) return derived;
  let derivedURL: URL;
  let originURL: URL;
  try {
    derivedURL = new URL(derived);
    originURL = new URL(origin);
  } catch {
    return origin; // base_url 解析不了，拿它也拼不出能用的命令
  }
  // URL 会把 :80 / :443 这类默认端口归一成空串，直接比 port 即可
  if (derivedURL.hostname !== originURL.hostname) return derived;
  if (derivedURL.port === originURL.port && derivedURL.protocol === originURL.protocol) return derived;
  return _.trimEnd(`${originURL.origin}${derivedURL.pathname}`, '/');
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

/** 单引号强引用，防止地址或密码里的特殊字符破坏命令（CollectSetup 复用） */
export function shellQuote(value: string): string {
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
 * 安装脚本里的 DOWNLOAD_BASE 是服务端按请求头渲染进去的，脚本刻意不让 `--server`
 * 或 `?host=` 影响它——那个地址下载的包会被 root 解开执行。可它推错时（反代吃掉
 * 端口）内网下载必失败、只能回退公网，用户没有任何补救手段。
 *
 * 所以这里显式吐出 `--download-base`：值就是用户眼前这个地址，而且脚本本身就是从
 * 它 curl 下来的，即被监控机器已证明能访问到；写进命令行也意味着操作者能看见自己
 * 授权了哪个下载源，而不是被链接里的参数悄悄改掉。
 *
 * 前提：services.ts 拉 /agents/categraf/meta 时不带 `?host=`，这个输入框的默认值
 * 就没有被链接参数注入的路径。改那个请求前先想清楚这条。
 */
function buildDownloadBaseArg(addr: string): string {
  return ` --download-base ${shellQuote(addr)}`;
}

/**
 * 拼出一键安装命令。
 * 必须是 `bash -s --` 形式：`| sudo bash --force` 会把参数吃掉而不报错。
 */
export function buildInstallCommand(options: BuildCommandOptions): string {
  const addr = normalizeServerAddr(options.serverAddr);
  if (!addr) return '';
  const { curlAuth, authArg } = buildAuthParts(options);
  return `curl -sSfL${curlAuth} ${shellQuote(`${addr}${INSTALL_SCRIPT_PATH}`)} | sudo bash -s -- --server ${shellQuote(addr)}${buildDownloadBaseArg(addr)}${authArg}`;
}

/** 不放心直接 pipe 到 bash 的用户，可以先下载审阅再执行 */
export function buildManualCommand(options: BuildCommandOptions): string {
  const addr = normalizeServerAddr(options.serverAddr);
  if (!addr) return '';
  const { curlAuth, authArg } = buildAuthParts(options);
  return `curl -sSfL${curlAuth} ${shellQuote(`${addr}${INSTALL_SCRIPT_PATH}`)} -o install-categraf.sh\nless install-categraf.sh\nsudo bash install-categraf.sh --server ${shellQuote(addr)}${buildDownloadBaseArg(addr)}${authArg}`;
}
