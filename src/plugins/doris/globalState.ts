import { createGlobalState } from 'react-hooks-global-state';
import moment from 'moment';

export const { useGlobalState, getGlobalState } = createGlobalState<{
  mySQLTableFields: string[];
}>({
  mySQLTableFields: [],
});
