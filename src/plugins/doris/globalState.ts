import { createGlobalState } from 'react-hooks-global-state';
import moment from 'moment';

export const { useGlobalState, getGlobalState } = createGlobalState<{
  mySQLTableFields: string[];
  explorerParsedRange: {
    start?: moment.Moment;
    end?: moment.Moment;
  };
  explorerSnapRange: { start?: number; end?: number }; // unix timestamp
}>({
  mySQLTableFields: [],
  explorerParsedRange: { start: undefined, end: undefined },
  explorerSnapRange: { start: undefined, end: undefined },
});
