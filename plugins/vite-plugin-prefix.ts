import fs from 'fs';
import path from 'path';
import type { Plugin, ResolvedConfig } from 'vite';

/**
 * 子路径部署（VITE_PREFIX，如 /flashcat）时，给"直接交给浏览器"的站内绝对路径补前缀。
 *
 * Router（basename）和 @/utils/request 已自带前缀；这里只处理绕过它们的输出点：
 * window.open / fetch / fetchEventSource / location.* / new Audio / new EventSource，
 * 以及 JSX 原生标签（img、a、iframe 等）的 src / href / poster。
 * 不能改写任意 '/xxx' 字符串：路由路径再加一次就会变成 /flashcat/flashcat/xxx。
 *
 * 改写方式是把参数包成 __n9eWithPrefix(expr)，运行时检查路径：已带前缀的应用路径、外链和相对路径原样返回；
 * 排除项会先去掉已存在的应用前缀，再保持在站点根路径。所以兼容已经手写 basePrefix + '/xxx' 的代码。
 * 字符串字面量直接在构建期算好，不留运行时调用。
 */

export interface PrefixPluginOptions {
  /** 不加前缀的路径前缀，如挂在域名根下的文档站 '/docs/' */
  exclude?: string[];
  /** 额外处理的组件及其 URL 属性（按编译后的标识符名匹配） */
  components?: Record<string, string[]>;
  /** 改写报告输出路径（相对项目根目录），仅 build 时写入 */
  reportFile?: string;
}

export interface PrefixRewrite {
  file: string;
  line: number;
  kind: string;
  code: string;
}

interface Node {
  type: string;
  start: number;
  end: number;
  [key: string]: any;
}

type Parse = (code: string) => Node;

const VIRTUAL_ID = 'virtual:n9e-prefix';
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_ID;
const HELPER = '__n9eWithPrefix';

const DEFAULT_EXCLUDE = ['/docs/'];
const DEFAULT_COMPONENTS: Record<string, string[]> = {
  Button: ['href'],
  Image: ['src'],
  Avatar: ['src'],
};
const URL_TAGS: Record<string, string[]> = {
  img: ['src'],
  a: ['href'],
  iframe: ['src'],
  audio: ['src'],
  video: ['src', 'poster'],
  source: ['src'],
  embed: ['src'],
  track: ['src'],
};
const GLOBAL_OBJECTS = ['window', 'globalThis', 'self'];
const JSX_RUNTIME_RE = /^react\/jsx(-dev)?-runtime$/;
const QUICK_TEST_RE = /\b(open|fetch|fetchEventSource|Audio|EventSource|location|jsxs?|jsxDEV|createElement)\b/;
const SCRIPT_RE = /\.(m?[jt]sx?)$/;

export function applyPrefix(prefix: string, exclude: string[], url: string): string {
  if (!prefix || url.charAt(0) !== '/' || url.charAt(1) === '/') return url;
  const alreadyPrefixed = url === prefix || url.startsWith(prefix + '/') || url.startsWith(prefix + '?') || url.startsWith(prefix + '#');
  const pathWithoutPrefix = alreadyPrefixed ? url.slice(prefix.length) : url;
  if (exclude.some((item) => pathWithoutPrefix.startsWith(item))) return pathWithoutPrefix;
  if (alreadyPrefixed) return url;
  return prefix + url;
}

/** 与 applyPrefix 逻辑一致，作为虚拟模块注入到业务代码 */
export function createRuntimeCode(prefix: string, exclude: string[]): string {
  return `const prefix = ${JSON.stringify(prefix)};
const exclude = ${JSON.stringify(exclude)};
export function ${HELPER}(url) {
  if (!prefix || typeof url !== 'string' || url.charAt(0) !== '/' || url.charAt(1) === '/') return url;
  const alreadyPrefixed = url === prefix || url.startsWith(prefix + '/') || url.startsWith(prefix + '?') || url.startsWith(prefix + '#');
  const pathWithoutPrefix = alreadyPrefixed ? url.slice(prefix.length) : url;
  for (let i = 0; i < exclude.length; i++) {
    if (pathWithoutPrefix.startsWith(exclude[i])) return pathWithoutPrefix;
  }
  if (alreadyPrefixed) return url;
  return prefix + url;
}
`;
}

function isIdentifier(node: Node | undefined, names?: string[]): boolean {
  return !!node && node.type === 'Identifier' && (!names || names.includes(node.name));
}

function memberName(node: Node | undefined): string | undefined {
  if (!node || node.type !== 'MemberExpression' || node.computed) return undefined;
  return node.property.type === 'Identifier' ? node.property.name : undefined;
}

function isLocationObject(node: Node | undefined): boolean {
  return isIdentifier(node, ['location']) || memberName(node) === 'location';
}

function propertyKey(node: Node): string | undefined {
  if (node.type !== 'Property' || node.computed) return undefined;
  if (node.key.type === 'Identifier') return node.key.name;
  if (node.key.type === 'Literal' && typeof node.key.value === 'string') return node.key.value;
  return undefined;
}

function walk(node: any, visit: (node: Node) => void) {
  if (!node || typeof node.type !== 'string') return;
  visit(node);
  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'start' || key === 'end' || key === 'loc' || key === 'range') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach((item) => walk(item, visit));
    } else if (child && typeof child.type === 'string') {
      walk(child, visit);
    }
  }
}

function positionOf(code: string, index: number): { line: number; column: number } {
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < index; i++) {
    if (code.charCodeAt(i) === 10) {
      line++;
      lineStart = i + 1;
    }
  }
  return { line, column: index - lineStart };
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeVlq(segment: string): number[] {
  const values: number[] = [];
  let value = 0;
  let shift = 0;
  for (let i = 0; i < segment.length; i++) {
    const digit = BASE64_CHARS.indexOf(segment[i]);
    value += (digit & 31) << shift;
    if (digit & 32) {
      shift += 5;
    } else {
      values.push(value & 1 ? -(value >>> 1) : value >>> 1);
      value = 0;
      shift = 0;
    }
  }
  return values;
}

/** 根据 sourcemap 的 mappings，把转换后代码的位置（行从 1 开始，列从 0 开始）映射回源码行号 */
export function createLineMapper(mappings: string): (line: number, column: number) => number | undefined {
  // 每个生成行：[生成列, 源码行, 生成列, 源码行, ...]，源码行从 0 开始
  const lines: number[][] = [];
  let sourceLine = 0;
  mappings.split(';').forEach((lineMappings) => {
    const segments: number[] = [];
    let column = 0;
    if (lineMappings) {
      lineMappings.split(',').forEach((segment) => {
        const values = decodeVlq(segment);
        column += values[0];
        if (values.length >= 4) {
          sourceLine += values[2];
          segments.push(column, sourceLine);
        }
      });
    }
    lines.push(segments);
  });
  return (line, column) => {
    const segments = lines[line - 1];
    if (!segments || !segments.length) return undefined;
    let result = segments[1];
    for (let i = 0; i < segments.length && segments[i] <= column; i += 2) {
      result = segments[i + 1];
    }
    return result + 1;
  };
}

/** start === end 表示插入；字面量是替换。嵌套输出点只会产生互不重叠的插入，可以全部保留 */
interface Edit {
  start: number;
  end: number;
  text: string;
  order: number;
}

export function transformPrefix(
  code: string,
  parse: Parse,
  prefix: string,
  options: {
    exclude?: string[];
    components?: Record<string, string[]>;
    file?: string;
    /** 把转换后代码的位置映射回源码行号；不传或返回 undefined 时使用转换后代码的行号 */
    mapLine?: (line: number, column: number) => number | undefined;
  } = {},
): { code: string; rewrites: PrefixRewrite[] } | null {
  if (!prefix || !QUICK_TEST_RE.test(code)) return null;
  const exclude = options.exclude ?? DEFAULT_EXCLUDE;
  const components = options.components ?? DEFAULT_COMPONENTS;
  const ast = parse(code);

  const jsxNames = new Set<string>();
  const createElementNames = new Set<string>();
  ast.body.forEach((stmt: Node) => {
    if (stmt.type !== 'ImportDeclaration') return;
    const source = stmt.source.value;
    stmt.specifiers.forEach((spec: Node) => {
      if (spec.type !== 'ImportSpecifier') return;
      if (JSX_RUNTIME_RE.test(source)) jsxNames.add(spec.local.name);
      if (source === 'react' && spec.imported.name === 'createElement') createElementNames.add(spec.local.name);
    });
  });

  const edits: Edit[] = [];
  const rewrites: PrefixRewrite[] = [];
  const handled = new Set<Node>();
  let needHelper = false;

  const wrap = (node: Node | undefined, kind: string, shorthandKey?: string) => {
    if (!node || handled.has(node) || node.type === 'SpreadElement') return;
    if (node.type === 'CallExpression' && isIdentifier(node.callee, [HELPER])) return;
    handled.add(node);
    const source = code.slice(node.start, node.end);
    const staticValue = node.type === 'Literal' ? node.value : node.type === 'TemplateLiteral' && node.expressions.length === 0 ? node.quasis[0].value.cooked : undefined;
    if (node.type === 'Literal' || staticValue !== undefined) {
      if (typeof staticValue !== 'string') return;
      const next = applyPrefix(prefix, exclude, staticValue);
      if (next === staticValue) return;
      edits.push({ start: node.start, end: node.end, text: JSON.stringify(next), order: edits.length });
    } else {
      if (node.type === 'TemplateLiteral' && !/^(\/|$)/.test(node.quasis[0].value.cooked)) return;
      const open = `${shorthandKey ? `${shorthandKey}: ` : ''}${HELPER}(`;
      edits.push({ start: node.start, end: node.start, text: open, order: edits.length });
      edits.push({ start: node.end, end: node.end, text: ')', order: edits.length });
      needHelper = true;
    }
    const position = positionOf(code, node.start);
    const line = options.mapLine?.(position.line, position.column) ?? position.line;
    rewrites.push({ file: options.file || '', line, kind, code: source });
  };

  const wrapProps = (props: Node | undefined, attrs: string[], kind: string) => {
    if (!props || props.type !== 'ObjectExpression') return;
    props.properties.forEach((prop: Node) => {
      const key = propertyKey(prop);
      if (!key || !attrs.includes(key)) return;
      wrap(prop.value, kind, prop.shorthand ? key : undefined);
    });
  };

  walk(ast, (node) => {
    if (node.type === 'CallExpression') {
      const { callee } = node;
      const arg0 = node.arguments[0];
      const name = memberName(callee);
      if (isIdentifier(callee, ['fetch', 'fetchEventSource'])) {
        wrap(arg0, callee.name);
      } else if ((name === 'open' || name === 'fetch') && isIdentifier(callee.object, GLOBAL_OBJECTS)) {
        wrap(arg0, `window.${name}`);
      } else if ((name === 'assign' || name === 'replace') && isLocationObject(callee.object)) {
        wrap(arg0, `location.${name}`);
      } else if ((isIdentifier(callee) && jsxNames.has(callee.name)) || name === 'createElement' || (isIdentifier(callee) && createElementNames.has(callee.name))) {
        if (arg0 && arg0.type === 'Literal' && typeof arg0.value === 'string' && URL_TAGS[arg0.value]) {
          wrapProps(node.arguments[1], URL_TAGS[arg0.value], `<${arg0.value}>`);
        } else if (arg0 && arg0.type === 'Identifier' && components[arg0.name]) {
          wrapProps(node.arguments[1], components[arg0.name], `<${arg0.name}>`);
        }
      }
    } else if (node.type === 'NewExpression') {
      if (isIdentifier(node.callee, ['Audio', 'EventSource'])) {
        wrap(node.arguments[0], `new ${node.callee.name}`);
      }
    } else if (node.type === 'AssignmentExpression' && node.operator === '=') {
      const { left } = node;
      const name = memberName(left);
      if (name === 'href' && isLocationObject(left.object)) {
        wrap(node.right, 'location.href');
      } else if (name === 'location' && isIdentifier(left.object, [...GLOBAL_OBJECTS, 'document'])) {
        wrap(node.right, 'window.location');
      }
    }
  });

  if (!edits.length) return null;

  // 从后往前应用；同一位置：先替换字面量，再插入，且内层（order 大）先插入，保证外层左括号在最前
  edits.sort((a, b) => b.start - a.start || b.end - a.end || b.order - a.order);
  let output = code;
  edits.forEach((edit) => {
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  });
  if (needHelper) {
    output = `import { ${HELPER} } from '${VIRTUAL_ID}';` + output;
  }
  return { code: output, rewrites };
}

export default function prefixPlugin(prefix: string, options: PrefixPluginOptions = {}): Plugin {
  const exclude = options.exclude ?? DEFAULT_EXCLUDE;
  const components = options.components ?? DEFAULT_COMPONENTS;
  const reportFile = options.reportFile ?? 'node_modules/.cache/prefix-rewrites.json';
  const rewrites: PrefixRewrite[] = [];
  let config: ResolvedConfig;
  let srcDir = '';

  return {
    name: 'prefix-plugin',
    enforce: 'post',
    configResolved(resolved) {
      config = resolved;
      srcDir = path.join(resolved.root, 'src') + path.sep;
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) return createRuntimeCode(prefix, exclude);
    },
    transform(code, id) {
      if (!prefix || id.includes('?') || id.includes('/node_modules/') || !SCRIPT_RE.test(id) || !id.startsWith(srcDir)) return;
      try {
        let lineMapper: ReturnType<typeof createLineMapper> | undefined;
        // 报告只在 build 时输出；esbuild 会删掉注释等内容，需要借助此前各插件合并后的 sourcemap 映射回源码行号
        const mapLine =
          config.command === 'build'
            ? (line: number, column: number) => {
                try {
                  lineMapper = lineMapper ?? createLineMapper(this.getCombinedSourcemap().mappings);
                } catch (e) {
                  return undefined;
                }
                return lineMapper(line, column);
              }
            : undefined;
        const result = transformPrefix(code, (input) => this.parse(input) as unknown as Node, prefix, {
          exclude,
          components,
          file: path.relative(config.root, id),
          mapLine,
        });
        if (!result) return;
        rewrites.push(...result.rewrites);
        // 只在行内插入/替换，不新增换行；map: null 表示沿用此前的 sourcemap
        return { code: result.code, map: null };
      } catch (e) {
        this.warn(`skip ${id}: ${(e as Error).message}`);
      }
    },
    closeBundle() {
      if (!prefix || config.command !== 'build') return;
      const file = path.resolve(config.root, reportFile);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(rewrites, null, 2));
      const files = new Set(rewrites.map((item) => item.file)).size;
      config.logger.info(`[prefix-plugin] ${prefix}: rewrote ${rewrites.length} url sinks in ${files} files, report: ${path.relative(config.root, file)}`);
    },
  };
}
