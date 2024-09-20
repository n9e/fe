/**
 * 脚本执行注意事项：
 * 1. package.json 添加 "type": "module"
 * 2. npx ts-node generate_each_locales.ts ${language}
 * 比如 npx ts-node generate_each_locales.ts zh_CN
 *
 * 通过 all_locales.json 生成每个语言包
 *
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lodash from 'lodash';
import { Project, SyntaxKind, VariableDeclarationKind } from 'ts-morph';
import prettier from 'prettier';

const lanugage = process.argv.slice(2)[0];
const builderFileContent = (lanugage, valueContent) => {
  const project = new Project();
  const sourceFile = project.createSourceFile('tempFile.ts', '', { overwrite: true });

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: lanugage,
        initializer: JSON.stringify(valueContent, null, 2),
      },
    ],
  });
  sourceFile.addExportAssignment({
    isExportEquals: false,
    expression: lanugage,
  });

  const fileContent = sourceFile.getFullText();
  const formattedContent = prettier.format(fileContent, { parser: 'typescript' });
  return formattedContent;
};

if (lanugage) {
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
  function resolvePaths(paths: string[]): string {
    return path.resolve(...paths);
  }

  /**
   * 根据 all_locales.json 生成每个语言包
   * 1. 读取 all_locales.json 内容
   * 2. 遍历 targets 根据 keys 获取 all_locales.json 中对应的内容
   * 3. 根据 keys 到对应的目录下生成 [lanugage].ts 文件
   */
  const localesJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'all_locales.json'), 'utf-8'));
  targets.forEach((target) => {
    const key = target.keys.join('.');
    const value = lodash.get(localesJson, key);
    if (value) {
      const valueKeys = lodash.keys(value);
      valueKeys.forEach((valueKey) => {
        const valueContent = value[valueKey];
        const resolvedPath = resolvePaths([__dirname, '../src', ...target.keys, valueKey, ...(lodash.isEqual(target.keys, ['locales']) ? [] : ['locale']), `${lanugage}.ts`]);
        fs.writeFileSync(resolvedPath, builderFileContent(lanugage, valueContent));
        if (!lodash.isEqual(target.keys, ['locales'])) {
          const localeIndexPath = resolvePaths([__dirname, '../src', ...target.keys, valueKey, 'locale', 'index.ts']);
          const project = new Project();
          const sourceFile = project.addSourceFileAtPath(localeIndexPath);
          sourceFile.addImportDeclaration({
            defaultImport: lanugage,
            moduleSpecifier: `./${lanugage}`,
          });
          const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
          const targetCallExpression = callExpressions.find((callExpression) => {
            const expression = callExpression.getExpression();
            return expression.getText() === 'i18next.addResourceBundle';
          });
          if (targetCallExpression) {
            const args = targetCallExpression.getArguments();
            const argValues = args.map((arg) => arg.getText());
            const i18nNs = argValues[1];
            sourceFile.addStatements(`i18next.addResourceBundle('${lanugage}', ${i18nNs}, ${lanugage});`);
          } else {
            console.log('未找到 i18next.addResourceBundle 方法调用');
          }
          sourceFile.saveSync();
        }
      });
    }
  });
} else {
  console.log('请传入语言参数, 比如 npx ts-node generate_each_locales.ts zh_CN');
}
export {};

// Path: scripts/generate_each_locales.js
