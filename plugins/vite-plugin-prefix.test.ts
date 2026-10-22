import * as acorn from 'acorn';
import { transformSync } from 'esbuild';
import { applyPrefix, createLineMapper, createRuntimeCode, transformPrefix } from './vite-plugin-prefix';

const PREFIX = '/flashcat';
const parse = (code: string) => acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' }) as any;
const run = (code: string, options: Parameters<typeof transformPrefix>[3] = {}) => transformPrefix(code, parse, PREFIX, options);
const output = (code: string) => run(code)?.code ?? code;

const loadRuntime = (prefix: string, exclude: string[]) => {
  const body = createRuntimeCode(prefix, exclude).replace('export function', 'function');
  return new Function(`${body}; return __n9eWithPrefix;`)() as (url: unknown) => unknown;
};

describe('applyPrefix', () => {
  it.each([
    ['/alert-rules', '/flashcat/alert-rules'],
    ['/', '/flashcat/'],
    ['/flashcat/alert-rules', '/flashcat/alert-rules'],
    ['/flashcat', '/flashcat'],
    ['/flashcat?x=1', '/flashcat?x=1'],
    ['/flashcatx', '/flashcat/flashcatx'],
    ['/flashcat/docs/content/a', '/docs/content/a'],
    ['https://flashcat.cloud/a', 'https://flashcat.cloud/a'],
    ['//cdn.example.com/a.js', '//cdn.example.com/a.js'],
    ['relative/path', 'relative/path'],
    ['#anchor', '#anchor'],
    ['data:image/png;base64,xx', 'data:image/png;base64,xx'],
    ['/docs/content/a', '/docs/content/a'],
  ] as const)('%s -> %s', (input, expected) => {
    expect(applyPrefix(PREFIX, ['/docs/'], input)).toBe(expected);
  });

  it('returns input unchanged without prefix', () => {
    expect(applyPrefix('', [], '/alert-rules')).toBe('/alert-rules');
  });

  it('runtime helper matches applyPrefix', () => {
    const helper = loadRuntime(PREFIX, ['/docs/']);
    ['/a', '/', '/flashcat/a', '/flashcat', 'https://x.com', '//x.com', '/docs/x', '/flashcat/docs/x', 'a'].forEach((url) => {
      expect(helper(url)).toBe(applyPrefix(PREFIX, ['/docs/'], url));
    });
    const urlObject = { href: '/a' };
    expect(helper(urlObject)).toBe(urlObject);
    expect(helper(undefined)).toBe(undefined);
  });
});

describe('transformPrefix', () => {
  it('skips work when prefix is empty', () => {
    expect(transformPrefix("window.open('/a')", parse, '')).toBeNull();
  });

  it('inlines static string literals', () => {
    expect(output("window.open('/alert-rules/edit/1', '_blank');")).toBe('window.open("/flashcat/alert-rules/edit/1", \'_blank\');');
    expect(output('fetch(`/api/n9e/version`);')).toBe('fetch("/flashcat/api/n9e/version");');
    expect(output("new Audio('/alert.mp3');")).toBe('new Audio("/flashcat/alert.mp3");');
  });

  it('wraps dynamic expressions with the runtime helper and injects the import', () => {
    const result = run('window.open(`/reports/edit/${id}?mode=clone`);');
    expect(result?.code).toBe("import { __n9eWithPrefix } from 'virtual:n9e-prefix';window.open(__n9eWithPrefix(`/reports/edit/${id}?mode=clone`));");
    expect(result?.rewrites).toEqual([{ file: '', line: 1, kind: 'window.open', code: '`/reports/edit/${id}?mode=clone`' }]);
  });

  it('leaves already-prefixed literals and external urls alone', () => {
    expect(run("window.open('/flashcat/a'); fetch('https://x.com/a'); location.href = '#top';")).toBeNull();
  });

  it('keeps manual basePrefix concatenation working through the idempotent helper', () => {
    expect(output('window.open(basePrefix + "/a");')).toContain('window.open(__n9eWithPrefix(basePrefix + "/a"))');
  });

  it('skips template literals that start with a non-path segment', () => {
    expect(run('fetch(`https://x.com/${id}`);')).toBeNull();
  });

  it('handles fetch, fetchEventSource and window.fetch', () => {
    const code = output('fetch(url); fetchEventSource(`${v2Prefix}/sse`); window.fetch(u);');
    expect(code).toContain('fetch(__n9eWithPrefix(url))');
    expect(code).toContain('fetchEventSource(__n9eWithPrefix(`${v2Prefix}/sse`))');
    expect(code).toContain('window.fetch(__n9eWithPrefix(u))');
  });

  it('handles location assignment and navigation calls', () => {
    const code = output("location.href = redirect || '/'; window.location.href = url; window.location = next; location.replace(a); window.location.assign(b);");
    expect(code).toContain("location.href = __n9eWithPrefix(redirect || '/')");
    expect(code).toContain('window.location.href = __n9eWithPrefix(url)');
    expect(code).toContain('window.location = __n9eWithPrefix(next)');
    expect(code).toContain('location.replace(__n9eWithPrefix(a))');
    expect(code).toContain('window.location.assign(__n9eWithPrefix(b))');
  });

  it('does not touch non-location replace calls or router navigation', () => {
    expect(run("redirect.replace(basePrefix, ''); history.push('/a'); const to = '/b';")).toBeNull();
  });

  it('rewrites jsx url props of native tags, including shorthand props', () => {
    const code = output(
      'import { jsx, jsxs } from "react/jsx-runtime";' +
        'jsx("img", { src: "/image/a.png" }); jsx("img", { src }); jsxs("a", { href: `/x/${id}`, children: [] }); jsx("div", { src: "/image/b.png" });',
    );
    expect(code).toContain('jsx("img", { src: "/flashcat/image/a.png" })');
    expect(code).toContain('jsx("img", { src: __n9eWithPrefix(src) })');
    expect(code).toContain('jsxs("a", { href: __n9eWithPrefix(`/x/${id}`), children: [] })');
    expect(code).toContain('jsx("div", { src: "/image/b.png" })');
  });

  it('rewrites whitelisted components but not arbitrary ones', () => {
    const code = output('import { jsx } from "react/jsx-runtime";jsx(Button, { href: "/a" }); jsx(Link, { to: "/a", href: "/b" });');
    expect(code).toContain('jsx(Button, { href: "/flashcat/a" })');
    expect(code).toContain('jsx(Link, { to: "/a", href: "/b" })');
  });

  it('supports React.createElement and jsxDEV with aliased imports', () => {
    expect(output('React.createElement("img", { src: p });')).toContain('React.createElement("img", { src: __n9eWithPrefix(p) })');
    expect(output('import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";_jsxDEV("iframe", { src: u }, void 0, false);')).toContain(
      '_jsxDEV("iframe", { src: __n9eWithPrefix(u) }',
    );
  });

  it('ignores jsx-like calls whose callee is not the jsx runtime', () => {
    expect(run('jsx("img", { src: "/a.png" });')).toBeNull();
  });

  it('composes nested sinks without breaking either', () => {
    const code = output('window.open(await fetch(`/api/${id}`).then((r) => r.url));');
    expect(code).toContain('window.open(__n9eWithPrefix(await fetch(__n9eWithPrefix(`/api/${id}`)).then((r) => r.url)))');
    expect(() => parse(code)).not.toThrow();
  });

  it('respects exclude', () => {
    expect(run("window.open('/docs/content/x')")).toBeNull();
    expect(output("window.open('/flashcat/docs/content/x')")).toBe('window.open("/docs/content/x")');
    expect(output("window.open('/docs/content/x')".replace('/docs', '/help'))).toContain('/flashcat/help');
  });

  it('reports source line numbers through the sourcemap after esbuild drops comments', () => {
    const source = [
      '/*',
      ' * Copyright header',
      ' */',
      "import React from 'react';",
      '',
      'export function A({ p }: { p: string }) {',
      '  const go = () => window.open(`/x/${p}`);',
      '  return (',
      '    <div onClick={go}>',
      '      <img src={p} />',
      '    </div>',
      '  );',
      '}',
    ].join('\n');
    const { code, map } = transformSync(source, { jsx: 'automatic', loader: 'tsx', sourcemap: 'external', sourcefile: 'a.tsx' });
    const mapper = createLineMapper(JSON.parse(map).mappings);
    const result = run(code, { mapLine: mapper });
    expect(result?.rewrites.map((item) => [item.kind, item.line])).toEqual([
      ['window.open', 7],
      ['<img>', 10],
    ]);
  });

  it('falls back to generated line numbers when the mapper has no answer', () => {
    expect(run('\n\nwindow.open(url);', { mapLine: () => undefined })?.rewrites[0].line).toBe(3);
  });

  it('works on real esbuild jsx output', () => {
    const source = "export default function A({ p }: { p: string }) { return <div><img src='/image/x.png' /><img src={p} /><a href={`/a/${p}`}>x</a></div>; }";
    const { code } = transformSync(source, { jsx: 'automatic', loader: 'tsx' });
    const result = output(code);
    expect(result).toContain('"/flashcat/image/x.png"');
    expect(result).toContain('src: __n9eWithPrefix(p)');
    expect(result).toContain('href: __n9eWithPrefix(`/a/${p}`)');
    expect(() => parse(result)).not.toThrow();
  });
});
