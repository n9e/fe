// flashcat.cloud 文档路径按语言的后缀约定：简体中文为原文，繁体加 _hk，其余语言加 _en
export const DOC_URL_LANG_SUFFIX: { [key: string]: string } = {
  zh_CN: '',
  zh_HK: '_hk',
  en_US: '_en',
  ja_JP: '_en',
  ru_RU: '_en',
};

// 在文档 URL 的末段追加语言后缀，保留 query/hash，例如
// https://flashcat.cloud/docs/content/xx/?from=n9e#step1 -> https://flashcat.cloud/docs/content/xx_en/?from=n9e#step1
// 仅处理 flashcat.cloud 文档站链接，私有化部署自定义的文档地址原样返回
export function localizeDocUrl(url: string, language: string) {
  const suffix = DOC_URL_LANG_SUFFIX[language] || '';
  if (!url || !suffix || !url.includes('flashcat.cloud')) return url;
  const match = url.match(/^([^?#]*?)\/?([?#].*)?$/);
  if (!match || !match[1]) return url;
  return `${match[1]}${suffix}/${match[2] || ''}`;
}
