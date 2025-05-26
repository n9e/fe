import { CommonStateContext } from '@/App';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  PAGESIZE_KEY?: string; // @deprecated Use pageSizeLocalstorageKey instead
  pageSizeLocalstorageKey?: string;
  defaultPageSize?: number;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
}

type TablePaginationPosition = 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';

export default function usePagination(props: PaginationProps) {
  const { tablePaginationPosition } = useContext(CommonStateContext);
  const { PAGESIZE_KEY, pageSizeLocalstorageKey, defaultPageSize = 10, pageSizeOptions = ['10', '20', '50', '100'], showSizeChanger = true } = props;
  const curPageSizeLocalstorageKey = pageSizeLocalstorageKey || PAGESIZE_KEY;
  const pageSizeLocalValue = curPageSizeLocalstorageKey ? localStorage.getItem(curPageSizeLocalstorageKey) : null;
  const [pageSize, setPageSize] = React.useState<number>(pageSizeLocalValue ? Number(pageSizeLocalValue) : defaultPageSize);
  const { t } = useTranslation();

  return {
    showSizeChanger,
    pageSize,
    pageSizeOptions,
    showTotal: (total) => {
      return t('common:table.total', { total });
    },
    onShowSizeChange: (_current, size) => {
      setPageSize(size);
      curPageSizeLocalstorageKey && localStorage.setItem(curPageSizeLocalstorageKey, size.toString());
    },
    position: tablePaginationPosition ? ([tablePaginationPosition] as TablePaginationPosition[]) : undefined,
  };
}
