/**
 * 脚本执行注意事项（同 generate_all_locales.ts）：
 * npx ts-node scripts/check_locale_keys.ts
 *
 * 以 zh_CN 为基准，检查每个 locale 目录：
 * 1. 其他语言文件相对 zh_CN 缺失的 key
 * 2. en_US 中 value 仍含中文（疑似未翻译）的 key
 *
 * 语言文件（zh_CN.ts / en_US.ts 等）约定为无外部依赖的纯对象模块，
 * 这里直接 transpile 后求值，require 一律返回空对象兜底。
 */

import fs from 'fs';
import path from 'path';
import * as glob from 'glob';
import ts from 'typescript';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LANGS = ['en_US', 'zh_HK', 'ja_JP', 'ru_RU'];
const CJK_RE = /[一-龥]/;

function loadLocale(file: string): any {
  const source = fs.readFileSync(file, 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const module = { exports: {} as any };
  new Function('module', 'exports', 'require', js)(module, module.exports, () => ({}));
  return module.exports.default ?? module.exports;
}

function flatten(obj: any, prefix = '', result: { [key: string]: any } = {}) {
  for (const key of Object.keys(obj || {})) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, fullKey, result);
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

const zhFiles = glob
  .sync(path.resolve(__dirname, '../src/**/{locale,locales}/zh_CN.ts'))
  .filter((file) => !file.includes('/plus/'))
  .sort();

let totalMissing = 0;
let totalUntranslated = 0;

for (const zhFile of zhFiles) {
  const dir = path.dirname(zhFile);
  const relDir = path.relative(path.resolve(__dirname, '..'), dir);
  const zhKeys = flatten(loadLocale(zhFile));

  const problems: string[] = [];
  for (const lang of LANGS) {
    const langFile = path.join(dir, `${lang}.ts`);
    if (!fs.existsSync(langFile)) {
      problems.push(`  [${lang}] 文件缺失`);
      continue;
    }
    const langKeys = flatten(loadLocale(langFile));
    const missing = Object.keys(zhKeys).filter((key) => !(key in langKeys));
    if (missing.length) {
      if (lang === 'en_US') totalMissing += missing.length;
      problems.push(`  [${lang}] 缺失 ${missing.length} 个 key: ${missing.join(', ')}`);
    }
    if (lang === 'en_US') {
      const untranslated = Object.keys(langKeys).filter((key) => typeof langKeys[key] === 'string' && CJK_RE.test(langKeys[key]));
      if (untranslated.length) {
        totalUntranslated += untranslated.length;
        problems.push(`  [${lang}] value 含中文 ${untranslated.length} 个 key: ${untranslated.join(', ')}`);
      }
    }
  }

  if (problems.length) {
    console.log(relDir);
    problems.forEach((problem) => console.log(problem));
  }
}

console.log(`\n共 ${zhFiles.length} 个 locale 目录；en_US 缺失 ${totalMissing} 个 key，value 含中文 ${totalUntranslated} 个 key`);
export {};
