import valueFormatter from '@/pages/dashboard/Renderer/utils/valueFormatter';

const specialFloatValues: Record<string, string> = {
  '+inf': '+Inf',
  inf: '+Inf',
  '+infinity': '+Inf',
  infinity: '+Inf',
  '-inf': '-Inf',
  '-infinity': '-Inf',
  nan: 'NaN',
};

/**
 * Prometheus 将 NaN 和无穷大以字符串形式放在查询响应中。
 * 这些值是有效的浮点结果，不能与缺失或非法数值混为一谈。
 */
export function formatPrometheusValue(value: unknown, unit?: string): string {
  if (typeof value === 'string') {
    const specialValue = specialFloatValues[value.trim().toLowerCase()];
    if (specialValue) {
      return specialValue;
    }
  }

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return '-';
  }

  const { text } = valueFormatter({ unit }, numberValue);
  return text == null ? '' : String(text);
}
