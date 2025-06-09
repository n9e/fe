import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { IS_ENT } from '@/utils/constant';

interface PaginationProps {
  PAGESIZE_KEY?: string; // @deprecated Use pageSizeLocalstorageKey instead
  pageSizeLocalstorageKey?: string;
  defaultPageSize?: number;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
}

type TablePaginationPosition = 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';

const DEFAULT_PAGESIZE_OPTIONS = IS_ENT ? [10, 15, 20, 50, 100] : [10, 20, 50, 100];
const DEFAULT_PAGESIZE = IS_ENT ? 15 : 10;

export default function usePagination(props: PaginationProps) {
  const { tablePaginationPosition } = useContext(CommonStateContext);
  const { PAGESIZE_KEY, pageSizeLocalstorageKey, defaultPageSize = DEFAULT_PAGESIZE, pageSizeOptions = DEFAULT_PAGESIZE_OPTIONS, showSizeChanger = true } = props;
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
