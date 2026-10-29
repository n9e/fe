import React, { createContext, Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';

export type DrawerFooterRender = () => React.ReactNode;

export interface DrawerFooterContextValue {
  setFooter: Dispatch<SetStateAction<DrawerFooterRender | null>>;
  refreshFooter: () => void;
}

export const DrawerFooterContext = createContext<DrawerFooterContextValue>({
  setFooter: () => undefined,
  refreshFooter: () => undefined,
});

export function useDrawerFooter() {
  const [footerRender, setFooter] = useState<DrawerFooterRender | null>(null);
  const [, setRevision] = useState(0);
  const refreshFooter = useCallback(() => setRevision((revision) => revision + 1), []);
  const context = useMemo(() => ({ setFooter, refreshFooter }), [refreshFooter, setFooter]);

  return {
    footer: footerRender?.() ?? null,
    context,
  };
}
