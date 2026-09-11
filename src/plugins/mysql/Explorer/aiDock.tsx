import { useRef } from 'react';
import type { FormInstance } from 'antd/lib/form/Form';

import { useAiQueryDock } from '@/components/AiQueryDock/useAiQueryDock';
import type { AiQueryDockAdapter } from '@/components/AiQueryDock/useAiQueryDock';
import { useFormQueryControl } from '@/components/AiQueryDock/useFormQueryControl';

// How this panel's statement is named to the assistant.
const SQL_DOCK: AiQueryDockAdapter = {
  datasourceType: 'mysql',
  action: {
    name: 'set_sql_query',
    argument: 'sql',
    language: 'SQL statement',
    followUpExample: '改成按小时汇总',
    page: { title: 'SQL explorer', summary: 'The user writes SQL against a MySQL data source and reads the rows it returns.' },
  },
  prompts: ['dock.prompt_sql_tables', 'dock.prompt_sql_per_minute', 'dock.prompt_sql_group'],
  resultNoun: 'rows',
  placeholder: 'dock.placeholder_first_sql',
};

interface Options {
  form: FormInstance;
  datasourceValue: number;
  /** Run the panel's query the way its button does. */
  commit: () => void;
  refresh: () => void;
}

/**
 * The assistant on the MySQL explorer: the dock, and the control it writes the
 * panel's form through. The panel puts `queryRowRef` round its query row and
 * `queryButtonRef` on its query button, hands `queryRequest` to its table, and
 * calls `invalidate` whenever the user takes the panel back.
 */
export function useMysqlAiDock({ form, datasourceValue, commit, refresh }: Options) {
  const queryRowRef = useRef<HTMLDivElement>(null);
  const queryButtonRef = useRef<HTMLButtonElement>(null);
  const undoRef = useRef<() => void>();
  const control = useFormQueryControl({
    form,
    datasourceValue,
    paths: () => ({ statement: ['query', 'query'], range: ['query', 'range'] }),
    // The box being empty is the panel's only rule, and the dock already
    // refuses that with a reason, so there is nothing here to validate.
    commit,
    refresh,
    // The box itself, not the whole row.
    queryInput: () => queryRowRef.current?.querySelector('.logql-codemirror') ?? queryRowRef.current,
    queryButton: () => queryButtonRef.current,
    onInvalidate: () => undoRef.current?.(),
  });
  const ai = useAiQueryDock(SQL_DOCK, { datasourceValue, getControl: control.getControl });
  undoRef.current = ai.invalidateUndo;
  return { trigger: ai.trigger, dock: ai.dock, invalidate: control.invalidate, queryRequest: control.queryRequest, queryRowRef, queryButtonRef };
}
