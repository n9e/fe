import { createGlobalState } from 'react-hooks-global-state';

export const { useGlobalState } = createGlobalState<{
  alertRules: { id: number; name: string }[];
}>({
  alertRules: [],
});
