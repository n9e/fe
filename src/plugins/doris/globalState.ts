import { createGlobalState } from 'react-hooks-global-state';
import moment from 'moment';

import { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';

export const { useGlobalState, getGlobalState } = createGlobalState<{
  mySQLTableFields: string[];
  explorerParsedRange: {
    start?: moment.Moment;
    end?: moment.Moment;
  };
  explorerSnapRange: { start?: number; end?: number }; // unix timestamp
  fieldConfig?: FieldConfigVersion2;
}>({
  mySQLTableFields: [],
  explorerParsedRange: { start: undefined, end: undefined },
  explorerSnapRange: { start: undefined, end: undefined },
  fieldConfig: undefined,
});
