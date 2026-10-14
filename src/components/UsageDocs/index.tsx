import React, { useContext } from 'react';
import { CommonStateContext } from '@/App';
import { IS_ENT } from '@/utils/constant';
import { shouldShowUsageDocs } from './visibility';

interface Props {
  children: React.ReactNode;
}

export default function UsageDocs({ children }: Props) {
  return useShowUsageDocs() ? <>{children}</> : null;
}

export function useShowUsageDocs(): boolean {
  const { hideUsageDocs } = useContext(CommonStateContext);
  return shouldShowUsageDocs(hideUsageDocs, IS_ENT);
}
