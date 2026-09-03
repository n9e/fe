/*
 * 仅「开发（serve）」阶段生效：把各 locale/index.(ts|js) 中「非当前语言」的语言 import
 * 就地替换为空对象，避免 dev 下每个 locale 目录都请求全部语言文件。
 *
 * 背景：i18n 用 import.meta.glob(eager) 加载全部 locale/index，每个 index 又静态
 * "import xx from './<lang>'" 引入全部语言 → 一个目录 11 个请求，全站 1000+。dev 实际只用
 * 一种语言，其余是浪费。
 *
 * 转换示例（当前语言 = en_US）：
 *   import zh_HK from './zh_HK';  =>  const zh_HK = {};
 *   import en_US from './en_US';  =>  （保留，真实加载）
 * resources 对象仍引用这些标识符，结构不变，非当前语言为 {} 不会报错。
 *
 * 当前语言由 VITE_DEV_LOCALE（默认 en_US）在启动时决定；prod 不受影响（apply: 'serve'）。
 *   - VITE_DEV_LOCALE=<lang>：只加载该语言，其余替换为 {}
 *   - VITE_DEV_LOCALE=all：不做任何裁剪，全部语言真实加载，可在页面上随意切换语言
 * 遇到非标准写法（如深层路径的语言 import）自动跳过，回退为全量加载，无副作用。
 */
// 需与 src/i18n.ts 中的 languages 保持一致，否则未列出的语言在 dev 下不会被裁剪
export const LANGS = ['zh_CN', 'en_US', 'zh_HK', 'ru_RU', 'ja_JP', 'pt_BR', 'es_ES', 'id_ID', 'ko_KR', 'fr_FR'];
export const ALL_LOCALES = 'all';

export default function devSingleLocale(activeLocale: string) {
  const loadAll = activeLocale === ALL_LOCALES;
  const active = LANGS.includes(activeLocale) ? activeLocale : 'en_US';
  const importRe = /import\s+(\w+)\s+from\s+'\.\/(\w+)';/g;

  return {
    name: 'dev-single-locale',
    enforce: 'pre' as const,
    apply: 'serve' as const,
    transform(code: string, id: string) {
      if (loadAll) return null;
      const clean = id.split('?')[0];
      if (!/\/(locale|locales)\/index\.(ts|js)$/.test(clean)) return null;
      let changed = false;
      const out = code.replace(importRe, (match, ident: string, lang: string) => {
        if (LANGS.includes(lang) && lang !== active) {
          changed = true;
          return `const ${ident} = {};`;
        }
        return match;
      });
      if (!changed) return null;
      return { code: out, map: null };
    },
  };
}
