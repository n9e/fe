import { CommonStateContext } from '@/App';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  PAGESIZE_KEY: string;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
}

type TablePaginationPosition = 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';

export default function usePagination(props: PaginationProps) {
  const { tablePaginationPosition } = useContext(CommonStateContext);
  const { PAGESIZE_KEY, pageSizeOptions = ['10', '20', '50', '100'], showSizeChanger = true } = props;
  const [pageSize, setPageSize] = React.useState<number>(Number(localStorage.getItem(PAGESIZE_KEY)) || 10);
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
      localStorage.setItem(PAGESIZE_KEY, size.toString());
    },
    position: tablePaginationPosition ? ([tablePaginationPosition] as TablePaginationPosition[]) : undefined,
  };
}
