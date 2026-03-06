import { createContext, useContext } from 'react';

interface CopilotSidebarContextType {
  openCopilot: () => void;
}

export const CopilotSidebarContext = createContext<CopilotSidebarContextType | null>(null);

export function useCopilotSidebar() {
  return useContext(CopilotSidebarContext);
}
