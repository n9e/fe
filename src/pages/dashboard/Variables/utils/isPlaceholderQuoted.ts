import { escapeRegExp } from './escapeString';

export default function isPlaceholderQuoted(expression: string, placeholder: string): boolean {
  // 转义占位符以安全地用于正则表达式
  const escapedPlaceholder = escapeRegExp(placeholder);
  // 使用反向引用来确保占位符前后的引号相同
  const regex = new RegExp(`(['"])${escapedPlaceholder}(\\\\)?\\1`);
  return regex.test(expression);
}
