import { Field } from '../utils';

export interface Props {
  loading: boolean;
  total: number;
  data: any[]; // 数据源，具体类型根据实际数据结构定义
  sorterRef: React.MutableRefObject<{ field: string; order: 'asc' | 'desc' }[]>;
  paginationOptions: {
    current: number;
    pageSize: number;
  };
  setPaginationOptions: (options: { current: number; pageSize: number }) => void;
  resetThenRefresh: () => void; // 重置并刷新数据
  getFields: () => Field[]; // 获取表格字段
  selectedFields: Field[]; // 已选择的字段
}
