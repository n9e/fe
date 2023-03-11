import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  PAGESIZE_KEY: string;
}

export default function usePagination(props: PaginationProps) {
  const { PAGESIZE_KEY } = props;
  const [pageSize, setPageSize] = React.useState<number>(Number(localStorage.getItem(PAGESIZE_KEY)) || 10);
  const { t } = useTranslation();

  return {
    showSizeChanger: true,
    pageSize,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total) => {
      return t('common:table.total', { total });
    },
    onShowSizeChange: (_current, size) => {
      setPageSize(size);
      localStorage.setItem(PAGESIZE_KEY, size.toString());
    },
  };
}
