const FROM_PARAM = 'from';
const FROM_VALUE = 'n9e-user';

// 需要携带渠道参数的目标站点（快猫官网与 Flashduty 控制台）
const TARGET_HOSTS = ['flashcat.cloud', 'www.flashcat.cloud', 'console.flashcat.cloud', 'flashduty.com', 'www.flashduty.com'];

// 指向官网/控制台的链接补充 from=n9e-user 渠道参数；已带 from 的链接保留原值
export function withFlashcatFrom(url: string): string {
  try {
    const u = new URL(url, window.location.href);
    if (!TARGET_HOSTS.includes(u.hostname)) return url;
    if (u.searchParams.get(FROM_PARAM)) return url;
    u.searchParams.set(FROM_PARAM, FROM_VALUE);
    return u.toString();
  } catch (e) {
    return url;
  }
}

// 全局拦截 <a> 链接点击，在跳转发生前改写 href（覆盖散落各处的文档/官网链接，无需逐一修改）
export function initFlashcatFrom() {
  const rewriteLink = (e: Event) => {
    const target = e.target as Element | null;
    if (!target || typeof target.closest !== 'function') return;
    const link = target.closest('a[href*="flashcat.cloud"], a[href*="flashduty.com"]') as HTMLAnchorElement | null;
    if (link) {
      link.href = withFlashcatFrom(link.href);
    }
  };
  document.addEventListener('mousedown', rewriteLink, true);
  document.addEventListener('touchstart', rewriteLink, true);
  document.addEventListener('click', rewriteLink, true);
}
