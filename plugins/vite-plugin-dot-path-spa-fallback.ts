import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

/**
 * 解决 dev server 对「带点号路径」不做 SPA 回退导致的 404。
 *
 * 背景：Vite 4.x 的 htmlFallbackMiddleware 调用 connect-history-api-fallback 时未传
 * `disableDotRule: true`，而该库默认会跳过 URL 最后一个斜杠后包含点号的请求（视为静态
 * 文件请求），例如 `/datasources/add/k8s.infrastructure` 会直接 404，请求到不了前端路由。
 *
 * 处理：在内部中间件之前注入一个前置中间件，对「带点号、且 public/root 下不存在对应
 * 静态文件」的路径，将其重写为 `/index.html`，交给 SPA 渲染；真实静态资源不受影响。
 */
export default function dotPathSpaFallback(): Plugin {
  return {
    name: 'vite-plugin-dot-path-spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const rawUrl = req.url || '';
        const [pathname, search] = rawUrl.split('?');
        // 不带点号、或属于 Vite 内部请求（/@fs/ /@vite/ 等）直接放行
        if (!pathname.includes('.') || pathname.startsWith('/@')) {
          return next();
        }
        const root = server.config.root;
        const candidates = [path.join(root, pathname), path.join(root, 'public', pathname)];
        const exists = candidates.some((p) => {
          try {
            return fs.statSync(p).isFile();
          } catch {
            return false;
          }
        });
        if (!exists) {
          req.url = '/index.html' + (search ? `?${search}` : '');
        }
        next();
      });
    },
  };
}
