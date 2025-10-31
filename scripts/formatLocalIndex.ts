import fs from 'fs';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';
import prettier from 'prettier';

// 查找所有 src 目录下的 locale/index.ts 文件
// const files = glob.sync('src/**/locale/index.ts');
const files = glob.sync('src/components/AuthorizationWrapper/locale/index.ts');

const getPrettierConfig = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const prettierConfigPath = path.resolve(__dirname, '../.prettierrc.json');
  const prettierConfigContent = fs.readFileSync(prettierConfigPath, 'utf-8');

  const result = JSON.parse(prettierConfigContent);
  result.parser = 'typescript';
  return result;
};

const prettierConfig = getPrettierConfig();

console.log(`找到 ${files.length} 个文件需要处理\n`);

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

files.forEach((filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 检查是否使用了旧格式（i18next.addResourceBundle）
    if (!content.includes('i18next.addResourceBundle')) {
      console.log(`⏭️  跳过: ${filePath} (已经是新格式)`);
      skipCount++;
      return;
    }

    // 提取 namespace（从第一个 addResourceBundle 调用中）
    const namespaceMatch = content.match(/i18next\.addResourceBundle\([^,]+,\s*(['"])?([^'",\s)]+)\1?/);
    if (!namespaceMatch) {
      console.log(`❌ 跳过: ${filePath} (无法提取 namespace)`);
      skipCount++;
      return;
    }

    const namespaceValue = namespaceMatch[2];
    const isStringLiteral = namespaceMatch[1];
    const namespace = isStringLiteral ? `'${namespaceValue}'` : namespaceValue;

    // 提取所有语言变量（从 addResourceBundle 调用中）
    const languages: string[] = [];
    const bundleRegex = /i18next\.addResourceBundle\([^,]+,\s*[^,]+,\s*(\w+)\)/g;
    let match;
    while ((match = bundleRegex.exec(content)) !== null) {
      languages.push(match[1]);
    }

    if (languages.length === 0) {
      console.log(`❌ 跳过: ${filePath} (没有找到语言变量)`);
      skipCount++;
      return;
    }

    // 删除 import i18next 这一行
    let newContent = content.replace(/import\s+i18next\s+from\s+['"]i18next['"];?\s*\n/g, '');

    // 匹配并替换所有的 i18next.addResourceBundle 调用
    // 使用 [\s\S] 来匹配包括换行符在内的所有字符
    newContent = newContent.replace(/i18next\.addResourceBundle[\s\S]*?;(\s*i18next\.addResourceBundle[\s\S]*?;)*/, () => {
      let result = `const resources = {
        namespace:  ${namespace},
        languages: {
         ${languages?.join(',')}
        },
      };
      export default resources;
      `;
      return result;
    });

    const formattedContent = prettier.format(newContent, prettierConfig);

    fs.writeFileSync(filePath, formattedContent, 'utf-8');
    console.log(`✅ 已转换: ${filePath} (namespace: ${namespace})`);
    successCount++;
  } catch (error) {
    console.log(`❌ 错误: ${filePath} - ${error}`);
    errorCount++;
  }
});

console.log('\n' + '='.repeat(60));
console.log('转换完成！');
console.log(`✅ 成功: ${successCount} 个`);
console.log(`⏭️  跳过: ${skipCount} 个`);
console.log(`❌ 错误: ${errorCount} 个`);
console.log('='.repeat(60));
