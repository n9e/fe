import { useCallback, useLayoutEffect, useRef } from 'react';
import _ from 'lodash';
import type { FormInstance } from 'antd/lib/form/Form';
import type { NamePath } from 'antd/lib/form/interface';

import type { IRawTimeRange } from '@/components/TimeRangePicker';
import type { QueryDockControl, QueryDockSnapshot } from './useQueryDockActions';
import { usePendingQuery } from './usePendingQuery';

/** Where a form-backed panel keeps the things the dock reads and writes. */
export interface FormQueryPaths {
  /** The statement the assistant delivers. */
  statement: NamePath;
  /** The time range, when the panel has one the assistant may move. */
  range?: NamePath;
  /** Panel settings an action may write along with the statement, by the name the action declares them under. */
  settings?: Record<string, NamePath>;
  /** Other fields that must come back with an undo, e.g. which syntax the panel was in. */
  extra?: Record<string, NamePath>;
}

export interface FormQuerySnapshot extends QueryDockSnapshot {
  range?: IRawTimeRange;
  settings?: Record<string, unknown>;
  extra?: Record<string, unknown>;
}

export interface FormQueryControlOptions {
  form: FormInstance;
  datasourceValue?: number;
  /** Read at every call, so a panel whose statement field depends on its mode can say so. */
  paths: () => FormQueryPaths;
  /** More to write when the assistant fills, e.g. forcing the view that can report rows. */
  fillExtras?: () => Record<string, unknown> | undefined;
  /** Refuse a run with a reason for the assistant, before anything is sent. */
  guard?: (statement: string, values: Record<string, unknown>) => string | undefined;
  /**
   * The panel's own form check, for rules the guard cannot stand in for. Leave
   * it out when it would only repeat the guard: the run then stays synchronous.
   */
  validate?: () => Promise<Record<string, unknown>>;
  /** Send the panel's query the way its button does. Synchronous: the fetch must go out in this block. */
  commit: (values: Record<string, unknown>) => void;
  /** Run again after a restore, no validation. */
  refresh: () => void;
  queryInput: () => Element | null;
  queryButton: () => Element | null;
  /** The user took the panel back; the page drops what the assistant could still undo. */
  onInvalidate?: () => void;
}

function fromPath(path: NamePath, value: unknown): Record<string, unknown> {
  return _.set({}, Array.isArray(path) ? path : [path], value);
}

/**
 * The dock's control for a panel that keeps its query on an antd form. The
 * page names its fields and how it runs; the snapshot, the revision counter,
 * the fill, the undo and the binding of a run to the fetch that answers it
 * come from here.
 */
export function useFormQueryControl(options: FormQueryControlOptions) {
  const latest = useRef(options);
  latest.current = options;
  const revisionRef = useRef(0);
  const lastFilledRef = useRef<string>();
  const pending = usePendingQuery();
  const controlRef = useRef<QueryDockControl<FormQuerySnapshot> | null>(null);

  /** The user took the panel back: bumps the revision and drops any run in flight. */
  const invalidate = useCallback(() => {
    revisionRef.current += 1;
    pending.clear();
    latest.current.onInvalidate?.();
  }, [pending]);
  /** The statement field changed; the assistant's own write does not count. */
  const onUserEdit = useCallback(
    (value?: string) => {
      if (value !== lastFilledRef.current) invalidate();
    },
    [invalidate],
  );

  useLayoutEffect(() => {
    const read = (path?: NamePath) => (path ? latest.current.form.getFieldValue(path) : undefined);
    const writeAll = (parts: Array<Record<string, unknown> | undefined>) => {
      latest.current.form.setFieldsValue(_.merge({}, ...parts.filter(Boolean)));
    };
    controlRef.current = {
      snapshot: () => {
        const paths = latest.current.paths();
        // A panel that declares no settings or extras gets a snapshot without
        // those keys, the shape it had before this factory.
        return _.omitBy(
          {
            query: read(paths.statement) || '',
            range: _.cloneDeep(read(paths.range)),
            settings: _.isEmpty(paths.settings) ? undefined : _.mapValues(paths.settings, (path) => read(path)),
            extra: _.isEmpty(paths.extra) ? undefined : _.mapValues(paths.extra, (path) => read(path)),
          },
          _.isUndefined,
        ) as FormQuerySnapshot;
      },
      revision: () => revisionRef.current,
      fill: (statement, range, settings) => {
        pending.abort();
        lastFilledRef.current = statement;
        const paths = latest.current.paths();
        writeAll([
          fromPath(paths.statement, statement),
          range && paths.range ? fromPath(paths.range, range) : undefined,
          ...Object.entries(settings ?? {}).map(([name, value]) => (paths.settings?.[name] ? fromPath(paths.settings[name], value) : undefined)),
          latest.current.fillExtras?.(),
        ]);
      },
      run: ({ signal } = {}) => {
        const { form, datasourceValue, guard, validate, commit } = latest.current;
        const statement: string = read(latest.current.paths().statement) || '';
        if (!statement.trim() || !datasourceValue) return Promise.reject(new Error('A query and data source are required'));
        const refusal = guard?.(statement, form.getFieldsValue(true));
        if (refusal) return Promise.reject(new Error(refusal));
        // Opening the run and sending it belong in one block: the fetcher gets
        // the request and the refresh in a single render, and the promise is
        // handed to the caller before anything can settle it.
        const start = (values: Record<string, unknown>) => {
          const result = pending.begin(signal);
          commit(values);
          return result;
        };
        if (!validate) return start(form.getFieldsValue(true));
        return validate().then(start, () => {
          throw new Error('The page rejected the query form');
        });
      },
      restore: (snapshot) => {
        pending.abort();
        lastFilledRef.current = snapshot.query;
        const paths = latest.current.paths();
        writeAll([
          fromPath(paths.statement, snapshot.query),
          paths.range ? fromPath(paths.range, snapshot.range) : undefined,
          ...Object.entries(snapshot.settings ?? {}).map(([name, value]) => (paths.settings?.[name] ? fromPath(paths.settings[name], value) : undefined)),
          ...Object.entries(snapshot.extra ?? {}).map(([name, value]) => (paths.extra?.[name] ? fromPath(paths.extra[name], value) : undefined)),
        ]);
        latest.current.refresh();
      },
      queryInput: () => latest.current.queryInput(),
      queryButton: () => latest.current.queryButton(),
    };
    return () => {
      controlRef.current = null;
    };
  });

  const getControl = useCallback(() => controlRef.current, []);
  return { getControl, invalidate, onUserEdit, queryRequest: pending.queryRequest };
}
