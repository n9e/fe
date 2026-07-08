/**
 * 仅在「生产构建」阶段，把用于优化 Vite dev 请求数的 `React.lazy(() => import('x'))`
 * 还原为静态 `import`。
 *
 * 背景：dev 下 Vite 原生 ESM「一个模块一个请求」，路由/页面若全部静态 import 会在登录页
 * 就拉起数千个模块。改为 React.lazy 后 dev 只按需加载。但生产已由 Rollup 打包，不存在
 * 「多请求」问题，业务希望产物保持懒加载改造前的形态（无额外按需 chunk、无路由级 Suspense）。
 *
 * 因此本插件只在 `vite build` 时生效（apply: 'build'），把下面两种写法转回静态 import：
 *   const X = React.lazy(() => import('spec'));
 *     -> import X from 'spec';
 *   const X = React.lazy(() => import('spec').then((m) => ({ default: m.Named })));
 *     -> import { Named as X } from 'spec';
 *
 * 仅作用于本次懒加载改造涉及的文件（各 entry.tsx、routers/index.tsx、App.tsx），
 * 不影响代码库中其它本就希望在生产也保持懒加载的 React.lazy 用法。
 */
export default function lazyToEagerOnBuild() {
  const shouldTransform = (id: string) => {
    const clean = id.split('?')[0];
    return clean.endsWith('/entry.tsx') || clean.endsWith('/routers/index.tsx') || clean.endsWith('/src/App.tsx');
  };

  // 具名导出：React.lazy(() => import('spec').then((m) => ({ default: m.Named })))
  const namedRe =
    /const\s+(\w+)\s*=\s*React\.lazy\(\s*\(\)\s*=>\s*import\(\s*(['"])(.+?)\2\s*\)\s*\.then\(\s*\(\s*m\s*\)\s*=>\s*\(\s*\{\s*default:\s*m\.(\w+)\s*\}\s*\)\s*\)\s*\)\s*;/g;
  // 默认导出：React.lazy(() => import('spec'))
  const defaultRe = /const\s+(\w+)\s*=\s*React\.lazy\(\s*\(\)\s*=>\s*import\(\s*(['"])(.+?)\2\s*\)\s*\)\s*;/g;

  return {
    name: 'lazy-to-eager-on-build',
    enforce: 'pre' as const,
    apply: 'build' as const,
    transform(code: string, id: string) {
      if (!shouldTransform(id) || !code.includes('React.lazy')) return null;
      const out = code
        .replace(namedRe, (_m, name, _q, spec, exported) => `import { ${exported} as ${name} } from '${spec}';`)
        .replace(defaultRe, (_m, name, _q, spec) => `import ${name} from '${spec}';`);
      if (out === code) return null;
      return { code: out, map: null };
    },
  };
}
