/**
 * 在当前目录生成一个完整的语言文件 n9e_locale.json, 用于翻译其他语言
 * 语言包来源于
 * 1. src/locales/*\/zh_CN.ts
 * 2. src/components/*\/locale/zh_CN.ts
 * 3. src/pages/*\/locale/zh_CN.ts
 * 4. src/pages/help/*\/locale/zh_CN.ts
 * 5. src/pages/warning/*\/locale/zh_CN.ts
 *
 * package.json 添加 "type": "module"
 * npx ts-node generate_all_locales.ts
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targets = [
  path.resolve(__dirname, '../src/locales/*/zh_CN.ts'),
  path.resolve(__dirname, '../src/components/*/locale/zh_CN.ts'),
  path.resolve(__dirname, '../src/pages/*/locale/zh_CN.ts'),
  path.resolve(__dirname, '../src/pages/help/*/locale/zh_CN.ts'),
  path.resolve(__dirname, '../src/pages/warning/*/locale/zh_CN.ts'),
  path.resolve(__dirname, '../src/plus/datasource/*/locale/zh_CN.ts'),
];
const allfiles: string[] = [];

targets.forEach((target) => {
  const files = glob.sync(target);
  allfiles.push(...files);
});

const allLocales: any = {};

for await (const file of allfiles) {
  const content = await import(file);
  const arr = file.split('/');
  let localeName = arr[arr.length - 2];
  if (localeName === 'locale') {
    localeName = arr[arr.length - 3];
    let module = arr[arr.length - 4];
    if (module === 'help' || module === 'warning') {
      module = arr[arr.length - 5];
    }
    allLocales[module] = allLocales[module] || {};
    allLocales[module][localeName] = content.default;
  } else {
    allLocales[localeName] = content.default;
  }
}

const content = JSON.stringify(allLocales, null, 2);

fs.writeFileSync(path.resolve(__dirname, 'n9e_locale.json'), content);
export {};

// Path: scripts/generate_all_locales.js
