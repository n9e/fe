const cacheKey = 'darkMode';
const urlParamKey = 'themeMode';

// 优先根据 url query 中有 themeMode=dark
// 其次根据 localStorage 中的 darkMode
export function getDarkMode() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(urlParamKey)) {
    return urlParams.get(urlParamKey) === 'dark';
  }
  const localDarkMode = localStorage.getItem(cacheKey);
  if (localDarkMode) {
    return localDarkMode === 'true' || localDarkMode === '1';
  }
  return false;
}

// 更新 localStorage 中的 darkMode
// 如果 url query 中有 themeMode 参数则同时更新 url query 中的 themeMode
export function updateDarkMode(value: boolean) {
  localStorage.setItem(cacheKey, String(value));
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(urlParamKey)) {
    urlParams.set(urlParamKey, value ? 'dark' : 'light');
  }
  const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
  window.history.replaceState({}, '', newUrl);
}

// 初始化主题，在页面渲染前设置主题类名，避免样式闪烁
export function initTheme() {
  const darkMode = getDarkMode();

  // 登录页不设置主题类名，由登录页自己处理
  if (!location.pathname.startsWith('/login')) {
    document.body.className = darkMode ? 'theme-dark' : 'theme-light';
  }
}
