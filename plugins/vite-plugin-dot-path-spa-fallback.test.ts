import fs from 'fs';
import os from 'os';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Connect, ViteDevServer } from 'vite';
import dotPathSpaFallback from './vite-plugin-dot-path-spa-fallback';

describe('dotPathSpaFallback', () => {
  let root: string;
  let middleware: Connect.NextHandleFunction;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'dot-path-spa-fallback-'));
    const use = jest.fn();
    const configureServer = dotPathSpaFallback().configureServer;
    if (typeof configureServer !== 'function') throw new Error('Expected a configureServer hook');
    configureServer({ config: { root }, middlewares: { use } } as unknown as ViteDevServer);
    middleware = use.mock.calls[0][0];
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  function request(url: string, headers: IncomingMessage['headers'] = { accept: 'text/html' }, method = 'GET') {
    const req = { url, headers, method } as IncomingMessage;
    const next = jest.fn();
    middleware(req, {} as ServerResponse, next);
    expect(next).toHaveBeenCalledTimes(1);
    return req.url;
  }

  it.each(['GET', 'HEAD'])('rewrites %s navigation to a dotted route and preserves the query', (method) => {
    expect(request('/datasources/add/k8s.infrastructure?view=edit', { accept: 'text/html' }, method)).toBe('/index.html?view=edit');
  });

  it.each(['document', 'iframe', 'frame', 'fencedframe'])('recognizes the %s fetch destination as navigation', (fetchDest) => {
    expect(request('/datasources/add/k8s.infrastructure', { 'sec-fetch-dest': fetchDest })).toBe('/index.html');
  });

  it.each([
    ['/node_modules/.vite/deps/missing.js?v=4af05479', { 'sec-fetch-dest': 'script', accept: '*/*' }],
    ['/src/missing.tsx?import', { 'sec-fetch-dest': 'script', accept: '*/*' }],
    ['/missing.js', { accept: '*/*' }],
    ['/missing.css', { 'sec-fetch-dest': 'style', accept: 'text/css' }],
    ['/missing.png', { 'sec-fetch-dest': 'image', accept: 'image/*' }],
    ['/api/missing.json', { accept: 'application/json' }],
  ])('preserves the original module or asset URL %s', (url, headers) => {
    expect(request(url, headers)).toBe(url);
  });

  it('preserves non-navigation fetch destinations even when HTML is accepted', () => {
    expect(request('/missing.js', { 'sec-fetch-dest': 'script', accept: 'text/html,*/*' })).toBe('/missing.js');
  });

  it('does not rewrite requests without HTML navigation headers', () => {
    expect(request('/missing.js', {})).toBe('/missing.js');
  });

  it('does not rewrite mutation requests', () => {
    expect(request('/api/missing.json', { accept: 'text/html' }, 'POST')).toBe('/api/missing.json');
  });

  it.each(['image/existing.png', 'public/image/existing.png'])('preserves an existing file in %s', (file) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), 'fixture');
    expect(request('/image/existing.png')).toBe('/image/existing.png');
  });

  it.each(['/dashboards/1426', '/@fs/missing.js', '/@vite/missing.js'])('leaves the route or internal URL %s to Vite', (url) => {
    expect(request(url)).toBe(url);
  });
});
