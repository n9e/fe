/**
 * 将毫秒数格式化为 xx天xx小时xx分钟xx秒xx毫秒 格式
 * @param {number} ms - 要转换的毫秒数
 * @returns {string} 格式化后的可读字符串
 */
export default function formatMsToHuman(ms: number): string {
  // 处理边缘情况：0毫秒或负数
  if (ms <= 0) return '-';

  const parts: string[] = [];
  let remaining = ms;

  // 提取天数（最大单位）
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  if (days > 0) {
    parts.push(`${days}d`);
    remaining -= days * 24 * 60 * 60 * 1000;
  }

  // 提取小时数
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  if (hours > 0) {
    parts.push(`${hours}h`);
    remaining -= hours * 60 * 60 * 1000;
  }

  // 提取分钟数
  const minutes = Math.floor(remaining / (60 * 1000));
  if (minutes > 0) {
    parts.push(`${minutes}m`);
    remaining -= minutes * 60 * 1000;
  }

  // 提取秒数
  const seconds = Math.floor(remaining / 1000);
  if (seconds > 0) {
    parts.push(`${seconds}s`);
    remaining -= seconds * 1000;
  }

  // 提取毫秒数
  if (remaining > 0 || parts.length === 0) {
    parts.push(`${Math.round(remaining)}ms`);
  }

  return parts.join('');
}
