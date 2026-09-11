import { useRef } from 'react';
import _ from 'lodash';
import type { FormInstance } from 'antd/lib/form/Form';

import { useAiQueryDock } from '@/components/AiQueryDock/useAiQueryDock';
import type { AiQueryDockAdapter } from '@/components/AiQueryDock/useAiQueryDock';
import { useFormQueryControl } from '@/components/AiQueryDock/useFormQueryControl';
import { Field } from './types';

// How this panel's statement is named to the assistant, one action per
// syntax: SQL mode takes a statement and suggests statements, search mode a
// filter plus the table it runs against and suggests filters.
const LOG_SQL_DOCK: AiQueryDockAdapter = {
  datasourceType: 'doris',
  action: {
    name: 'set_log_query',
    argument: 'sql',
    language: 'Doris SQL statement',
    followUpExample: '只看 ERROR 级别',
    page: { title: 'Log explorer', summary: 'The user writes SQL against a Doris log table and reads the rows it returns.' },
  },
  prompts: ['dock.prompt_log_errors', 'dock.prompt_log_per_minute', 'dock.prompt_log_group'],
  resultNoun: 'rows',
  placeholder: 'dock.placeholder_first_sql',
};
const LOG_SEARCH_DOCK: AiQueryDockAdapter = {
  datasourceType: 'doris',
  action: {
    name: 'set_log_search',
    argument: 'query',
    language: 'Doris log search expression (the inverted-index syntax, e.g. level:error AND msg:"timeout")',
    followUpExample: '只看 ERROR 级别',
    settings: [
      { name: 'database', description: 'The database to search. Omit to keep the one the sidebar has.' },
      { name: 'table', description: 'The table to search. Omit to keep the one the sidebar has.' },
      { name: 'time_field', description: "The table's time column. Omit to keep the one the sidebar has." },
    ],
    page: { title: 'Log explorer', summary: 'The user filters a Doris log table with a search expression and reads the matching logs.' },
  },
  prompts: ['dock.prompt_search_errors', 'dock.prompt_search_service', 'dock.prompt_search_timeout'],
  resultNoun: 'rows',
  placeholder: 'dock.placeholder_first_sql',
};

interface Options {
  form: FormInstance;
  datasourceValue: number;
  syntax?: string;
  /** The columns the sidebar has loaded for the selected table. */
  indexData: Field[];
  /** Send a validated query the way the query button does. */
  commit: (values: Record<string, unknown>) => void;
}

/**
 * The assistant on the Doris log explorer: the dock, and the control it
 * writes the panel's form through. The panel hands `queryBoxRef`,
 * `queryButtonRef`, `queryRequest` and `onQueryEdit` to its query row, keeps
 * the editor in flow while `open`, and calls `invalidate` whenever the user
 * takes the panel back.
 */
export function useDorisAiDock({ form, datasourceValue, syntax, indexData, commit }: Options) {
  const queryBoxRef = useRef<HTMLDivElement>(null);
  const queryButtonRef = useRef<HTMLButtonElement>(null);
  const undoRef = useRef<() => void>();
  const inSQL = () => form.getFieldValue(['query', 'syntax']) === 'sql';
  // SQL mode delivers a statement, search mode a filter plus the table it runs
  // against; the sidebar's choice stays unless the action names another.
  const control = useFormQueryControl({
    form,
    datasourceValue,
    paths: () => ({
      statement: inSQL() ? ['query', 'sql'] : ['query', 'query'],
      range: ['query', 'range'],
      settings: { database: ['query', 'database'], table: ['query', 'table'], time_field: ['query', 'time_field'] },
      extra: { syntax: ['query', 'syntax'] },
    }),
    // Rows are the honest view of a statement; the time series view needs
    // value columns the assistant never chose.
    fillExtras: () => (inSQL() ? { query: { sqlVizType: 'table' } } : undefined),
    guard: (statement, values) => {
      const query = (values.query ?? {}) as { syntax?: string; database?: string; table?: string; time_field?: string };
      // The page refuses to run an unbounded scan; say so instead of popping its modal.
      if (query.syntax === 'sql' && !statement.includes('$__time') && !statement.includes('$__unixEpoch')) {
        return 'The statement must bound time with $__timeFilter(<time column>) or $__unixEpochFilter(<time column>)';
      }
      if (query.syntax !== 'sql' && !(query.database && query.table && query.time_field)) {
        return 'Search mode needs a database, a table and a time column: pass them with the expression';
      }
      return undefined;
    },
    validate: () => form.validateFields(),
    commit,
    refresh: () => form.setFieldsValue({ refreshFlag: _.uniqueId('refreshFlag_') }),
    queryInput: () => queryBoxRef.current,
    queryButton: () => queryButtonRef.current,
    onInvalidate: () => undoRef.current?.(),
  });
  const ai = useAiQueryDock(syntax === 'sql' ? LOG_SQL_DOCK : LOG_SEARCH_DOCK, {
    datasourceValue,
    getControl: control.getControl,
    // The table the sidebar has picked, and the columns it loaded so the
    // assistant need not probe the table it is looking at; capped, with the
    // true count beside it.
    pageParams: () => {
      const query = form.getFieldValue('query') || {};
      return {
        query_parameters: _.pickBy(
          {
            syntax: query.syntax,
            database: query.database,
            table: query.table,
            time_field: query.time_field,
            fields: indexData
              .slice(0, 100)
              .map((field) => `${field.field}:${field.type}`)
              .join(', '),
            fields_total: indexData.length ? String(indexData.length) : '',
          },
          (value) => typeof value === 'string' && value !== '',
        ),
      };
    },
  });
  undoRef.current = ai.invalidateUndo;
  return {
    trigger: ai.trigger,
    dock: ai.dock,
    open: ai.open,
    invalidate: control.invalidate,
    onQueryEdit: control.onUserEdit,
    queryRequest: control.queryRequest,
    queryBoxRef,
    queryButtonRef,
  };
}
