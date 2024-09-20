/**
 * 脚本执行注意事项：
 * 1. package.json 添加 "type": "module"
 * 2. npx ts-node generate_all_locales.ts
 *
 * 在当前目录生成一个完整的语言文件 all_locale.json, 用于翻译其他语言
 * 语言包来源于
 * 1. src/locales/*\/zh_CN.ts
 * 2. src/components/*\/locale/zh_CN.ts
 * 3. src/pages/*\/locale/zh_CN.ts
 * 4. src/pages/help/*\/locale/zh_CN.ts
 * 5. src/pages/warning/*\/locale/zh_CN.ts
 * 6. src/plus/components/*\/locale/zh_CN.ts
 * 7. src/plus/datasource/*\/locale/zh_CN.ts
 * 8. src/plus/pages/*\/locale/zh_CN.ts
 * 9. src/plus/parcels/*\/locale/zh_CN.ts
 *
 */

import fs from 'fs';
import path from 'path';
import * as glob from 'glob';
import { fileURLToPath } from 'url';
import lodash from 'lodash';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targets = [
  {
    path: path.resolve(__dirname, '../src/locales/*/zh_CN.ts'),
    keys: ['locales'],
  },
  {
    path: path.resolve(__dirname, '../src/components/*/locale/zh_CN.ts'),
    keys: ['components'],
  },
  {
    path: path.resolve(__dirname, '../src/pages/*/locale/zh_CN.ts'),
    keys: ['pages'],
  },
  {
    path: path.resolve(__dirname, '../src/pages/help/*/locale/zh_CN.ts'),
    keys: ['pages', 'help'],
  },
  {
    path: path.resolve(__dirname, '../src/pages/warning/*/locale/zh_CN.ts'),
    keys: ['pages', 'warning'],
  },
  {
    path: path.resolve(__dirname, '../src/plus/components/*/locale/zh_CN.ts'),
    keys: ['plus', 'components'],
  },
  {
    path: path.resolve(__dirname, '../src/plus/datasource/*/locale/zh_CN.ts'),
    keys: ['plus', 'datasource'],
  },
  {
    path: path.resolve(__dirname, '../src/plus/pages/*/locale/zh_CN.ts'),
    keys: ['plus', 'pages'],
  },
  {
    path: path.resolve(__dirname, '../src/plus/parcels/*/locale/zh_CN.ts'),
    keys: ['plus', 'parcels'],
  },
];

const allfiles: {
  files: string[];
  keys: string[];
}[] = [];

targets.forEach((target) => {
  const files = glob.sync(target.path);
  allfiles.push({
    files,
    keys: target.keys,
  });
});

const allLocales: any = {};

for await (const item of allfiles) {
  for await (const file of item.files) {
    const content = await import(file);
    const arr = file.split('/');
    let localeName = arr[arr.length - 2];
    if (localeName === 'locale') {
      localeName = arr[arr.length - 3];
      lodash.set(allLocales, [...item.keys, localeName], content.default);
    } else {
      lodash.set(allLocales, [...item.keys, localeName], content.default);
    }
  }
}

const content = JSON.stringify(allLocales, null, 2);

fs.writeFileSync(path.resolve(__dirname, 'all_locales.json'), content);
export {};

// Path: scripts/generate_all_locales.js
