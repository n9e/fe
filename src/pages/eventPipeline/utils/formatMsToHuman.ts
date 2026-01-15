/**
 * 将毫秒数格式化为英文文本化的人类可读时间字符串
 * @param {number} ms - 要转换的毫秒数，支持正数/负数/0
 * @param {Object} [options] - 配置选项
 * @param {boolean} [options.forceAllUnits=false] - 是否强制显示所有单位（即使值为0）
 * @param {boolean} [options.showMs=false] - 是否显示毫秒部分
 * @param {boolean} [options.compact=false] - 是否使用紧凑格式（如1d2h3m4s）
 * @returns {string} 格式化后的英文时间字符串
 */
export default function formatMsToHuman(
  ms,
  options: {
    forceAllUnits?: boolean;
    showMs?: boolean;
    compact?: boolean;
  } = {
    forceAllUnits: false,
    showMs: true,
    compact: true,
  },
) {
  // 输入合法性校验
  if (typeof ms !== 'number' || isNaN(ms)) {
    throw new TypeError('Input must be a valid number of milliseconds');
  }

  // 解构配置并设置默认值
  const { forceAllUnits = false, showMs = false, compact = false } = options;

  // 处理负数时间（保留符号后处理绝对值）
  const isNegative = ms < 0;
  const absMs = Math.abs(ms);

  // 定义时间单位配置：{ 换算值, 完整名称, 紧凑缩写 }
  const UNITS = [
    { value: 86400000, full: 'day', short: 'd' }, // 1天
    { value: 3600000, full: 'hour', short: 'h' }, // 1小时
    { value: 60000, full: 'minute', short: 'm' }, // 1分钟
    { value: 1000, full: 'second', short: 's' }, // 1秒
    { value: 1, full: 'millisecond', short: 'ms' }, // 1毫秒（仅在showMs=true时启用）
  ];

  // 过滤掉不需要的毫秒单位（除非配置显示）
  const activeUnits = showMs ? UNITS : UNITS.slice(0, -1);

  // 计算各单位的数值
  let remaining = absMs;
  const unitValues = activeUnits.map((unit) => {
    const count = Math.floor(remaining / unit.value);
    remaining %= unit.value;
    return { ...unit, count };
  });

  // 构建时间片段数组
  const timeParts: string[] = [];
  for (const { count, full, short } of unitValues) {
    // 仅在强制显示或数值大于0时添加
    if (forceAllUnits || count > 0) {
      // 处理单复数和格式
      const unitLabel = compact ? short : `${full}${count !== 1 ? 's' : ''}`;

      timeParts.push(`${count}${compact ? '' : ' '}${unitLabel}`);
    }
  }

  // 处理空结果边界情况（输入为0且不强制显示单位）
  if (timeParts.length === 0) {
    return showMs ? '0 milliseconds' : '0 seconds';
  }

  // 拼接结果并添加符号
  const result = compact ? timeParts.join('') : timeParts.join(', ');

  return isNegative ? `-${result}` : result;
}

// ------------------------------
// 示例用法
// ------------------------------
// console.log(formatMsToHuman(123456789));
// 输出: "1 day, 10 hours, 17 minutes, 36 seconds"

// console.log(formatMsToHuman(3661000, { compact: true }));
// 输出: "1h1m1s"

// console.log(formatMsToHuman(1234, { showMs: true }));
// 输出: "1 second, 234 milliseconds"

// console.log(formatMsToHuman(-654321000, { forceAllUnits: true }));
// 输出: "-18 days, 10 hours, 32 minutes, 0 seconds"

// console.log(formatMsToHuman(0));
// 输出: "0 seconds"
