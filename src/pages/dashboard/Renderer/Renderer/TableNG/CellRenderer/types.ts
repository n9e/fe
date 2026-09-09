export interface TextObject {
  // 非数值数据时 stat 可能是字符串/null，排序处（如 TableNG comparator）需自行判断
  stat: number | string | null | undefined;
  value: string | number;
  unit?: string;
  color: string;
  text: string;
  valueDomain: [number, number];
}
