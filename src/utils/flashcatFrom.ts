import { getN9eSiteDocUrl, isChineseLanguage } from './n9eSiteDoc';

const FROM_PARAM = 'from';

// 需要携带渠道参数的目标站点及取值：快猫官网与 Flashduty 控制台为 n9e-user，夜莺新官网为 v9-n9e-user
const FROM_VALUE_BY_HOST: Record<string, string> = {
  'flashcat.cloud': 'n9e-user',
  'www.flashcat.cloud': 'n9e-user',
  'console.flashcat.cloud': 'n9e-user',
  'flashduty.com': 'n9e-user',
  'www.flashduty.com': 'n9e-user',
  'n9e.github.io': 'v9-n9e-user',
};

// 指向官网/控制台的链接补充 from 渠道参数；已带 from 的链接保留原值
export function withFlashcatFrom(url: string): string {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.href : undefined);
    const FROM_VALUE = FROM_VALUE_BY_HOST[u.hostname];
    if (!FROM_VALUE) return url;
    if (u.searchParams.get(FROM_PARAM)) return url;
    if (!u.search) {
      u.searchParams.set(FROM_PARAM, FROM_VALUE);
      return u.toString();
    }
    // 已有 query 时按原文插入，避免 URLSearchParams 重新序列化（如 ?onlyContent 会被改成 ?onlyContent=）
    const hashIndex = url.indexOf('#');
    const base = hashIndex === -1 ? url : url.slice(0, hashIndex);
    const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
    return `${base}${base.endsWith('?') || base.endsWith('&') ? '' : '&'}${FROM_PARAM}=${FROM_VALUE}${hash}`;
  } catch (e) {
    return url;
  }
}

interface InitFlashcatFromOptions {
  getLanguage?: () => string | undefined;
  isEnt?: boolean;
}

// 全局拦截 <a> 链接点击，在跳转发生前改写 href（覆盖散落各处的文档/官网链接，无需逐一修改）：
// 非中文界面先把 flashcat.cloud 旧文档换成夜莺新官网对应页面，再补充 from 渠道参数
export function initFlashcatFrom({ getLanguage, isEnt = false }: InitFlashcatFromOptions = {}) {
  const rewriteLink = (e: Event) => {
    const target = e.target as Element | null;
    if (!target || typeof target.closest !== 'function') return;
    const link = target.closest('a[href*="flashcat.cloud"], a[href*="flashduty.com"], a[href*="n9e.github.io"]') as HTMLAnchorElement | null;
    if (link) {
      const language = getLanguage?.();
      const n9eSiteDocUrl = !isEnt && language && !isChineseLanguage(language) ? getN9eSiteDocUrl(link.href) : undefined;
      link.href = withFlashcatFrom(n9eSiteDocUrl ?? link.href);
    }
  };
  document.addEventListener('mousedown', rewriteLink, true);
  document.addEventListener('touchstart', rewriteLink, true);
  document.addEventListener('click', rewriteLink, true);
}
