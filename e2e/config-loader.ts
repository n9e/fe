import fs from 'node:fs';
import path from 'node:path';

function getConfigFileNameStem(fileName: string): string {
  return fileName.replace(/\.json$/, '');
}

/**
 * 从环境变量 E2E_CONFIGS 读取白名单，值为逗号分隔的配置文件名称（不含 .json 后缀）。
 * 例如：E2E_CONFIGS=es-index,prometheus-v1
 * 如果未设置或为空，不过滤。
 */
function getWhitelist(): string[] | null {
  const raw = process.env.E2E_CONFIGS;
  if (!raw) return null;
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function loadAlertRuleConfigs<T>(configDir: string): T[] {
  if (!fs.existsSync(configDir)) {
    throw new Error(`Alert rule config directory does not exist: ${configDir}`);
  }

  let configFiles = fs
    .readdirSync(configDir)
    .filter((fileName) => fileName.endsWith('.json'))
    .sort();

  if (configFiles.length === 0) {
    throw new Error(`No alert rule config files found in ${configDir}`);
  }

  const whitelist = getWhitelist();
  if (whitelist) {
    configFiles = configFiles.filter((fileName) => whitelist.includes(getConfigFileNameStem(fileName)));
    if (configFiles.length === 0) {
      throw new Error(
        `No alert rule config files match the whitelist: ${whitelist.join(', ')}. Available configs: ${fs
          .readdirSync(configDir)
          .filter((f) => f.endsWith('.json'))
          .map(getConfigFileNameStem)
          .join(', ')}`,
      );
    }
  }

  return configFiles.map((fileName) => {
    const filePath = path.join(configDir, fileName);
    const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return config;
  });
}
