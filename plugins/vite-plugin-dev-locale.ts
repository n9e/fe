/*
 * 仅「开发（serve）」阶段生效：把各 locale/index.(ts|js) 中「非当前语言」的语言 import
 * 就地替换为空对象，避免 dev 下每个 locale 目录都请求全部 5 种语言文件。
 *
 * 背景：i18n 用 import.meta.glob(eager) 加载全部 locale/index，每个 index 又静态
 * "import xx from './<lang>'" 引入 5 种语言 → 一个目录 6 个请求，全站 700+。dev 实际只用
 * 一种语言，其余是浪费。
 *
 * 转换示例（当前语言 = zh_CN）：
 *   import zh_HK from './zh_HK';  =>  const zh_HK = {};
 *   import zh_CN from './zh_CN';  =>  （保留，真实加载）
 * resources 对象仍引用这些标识符，结构不变，非当前语言为 {} 不会报错。
 *
 * 当前语言由 VITE_DEV_LOCALE（默认 zh_CN）在启动时决定；prod 不受影响（apply: 'serve'）。
 * 遇到非标准写法（如深层路径的语言 import）自动跳过，回退为全量加载，无副作用。
 */
const LANGS = ['zh_CN', 'en_US', 'zh_HK', 'ru_RU', 'ja_JP'];

export default function devSingleLocale(activeLocale: string) {
  const active = LANGS.includes(activeLocale) ? activeLocale : 'zh_CN';
  const importRe = /import\s+(\w+)\s+from\s+'\.\/(\w+)';/g;

  return {
    name: 'dev-single-locale',
    enforce: 'pre' as const,
    apply: 'serve' as const,
    transform(code: string, id: string) {
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
