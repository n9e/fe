import { useEffect, useRef } from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { DatasourceCateEnum } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import useQueryWorkspace from '@/pages/logExplorer/components/QueryWorkspace/useQueryWorkspace';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../constants';
import { buildSql } from '../services';
import getErrorMessage from '@/pages/logExplorer/components/QueryWorkspace/getErrorMessage';
import type { AggregateConfig, FilterConfig, OrderByConfig } from './types';

export interface DorisBuilderValues {
  filters: FilterConfig[];
  aggregates: AggregateConfig[];
  mode: 'table' | 'timeseries';
  group_by: string[];
  order_by: OrderByConfig[];
  limit?: number;
}

export type DorisGeneratedMetadata = Awaited<ReturnType<typeof buildSql>>;

export const defaultBuilderValues: DorisBuilderValues = {
  filters: [],
  aggregates: [],
  mode: 'table',
  group_by: [],
  order_by: [],
  limit: undefined,
};

interface Options {
  form: FormInstance;
  datasourceValue?: number;
  execute: () => Promise<void>;
  onQueryEdit: (sql?: string) => void;
}

export default function useDorisQueryWorkspace({ form, datasourceValue, execute, onQueryEdit }: Options) {
  const { t } = useTranslation(NAME_SPACE);
  const [builderForm] = Form.useForm<DorisBuilderValues>();
  const database = Form.useWatch(['query', 'database'], form);
  const table = Form.useWatch(['query', 'table'], form);
  const timeField = Form.useWatch(['query', 'time_field'], form);
  const range = Form.useWatch(['query', 'range'], form);
  const syntax = Form.useWatch(['query', 'syntax'], form);
  const contextKey = JSON.stringify([datasourceValue, database, table, timeField]);

  const workspace = useQueryWorkspace<DorisGeneratedMetadata>({
    contextKey,
    build: async () => {
      const query = form.getFieldValue('query') || {};
      if (!datasourceValue || !query.database || !query.table || !query.time_field) {
        throw new Error(t('database_table_required'));
      }
      if (!query.range) throw new Error(t(`${logExplorerNS}:query_workspace.range_required`));
      const values = await builderForm.validateFields();
      const parsedRange = parseRange(query.range);
      const metadata = await buildSql({
        cate: DatasourceCateEnum.doris,
        datasource_id: datasourceValue,
        query: [
          {
            database: query.database,
            table: query.table,
            time_field: query.time_field,
            from: moment(parsedRange.start).valueOf(),
            to: moment(parsedRange.end).valueOf(),
            filters: values.filters || [],
            aggregates: values.aggregates || [],
            mode: values.mode || 'table',
            group_by: values.group_by || [],
            order_by: (values.order_by || []).filter((item): item is { field: string; direction: 'asc' | 'desc' } => !!item.field && !!item.direction),
            limit: values.limit ?? undefined,
          },
        ],
      }).catch((err) => {
        // Silenced requests reject with the response body and others with an Error: normalize both so the panel
        // always shows the server's own message instead of a generic one.
        throw new Error(getErrorMessage(err, t('query.editMode.build_sql_failed')));
      });
      return { statement: metadata.sql, metadata };
    },
    applyGenerated: ({ statement, metadata }) => {
      onQueryEdit(statement);
      // Converting is not running: switching table/timeseries remounts the result view, and the previous run's
      // flag would make it query this statement on its own. Keep the flag when the view is not swapped.
      const viewSwitched = form.getFieldValue(['query', 'sqlVizType']) !== metadata.mode;
      form.setFieldsValue({
        ...(viewSwitched ? { refreshFlag: undefined } : {}),
        query: { sql: statement, sqlVizType: metadata.mode, keys: { valueKey: metadata.value_key, labelKey: metadata.label_key } },
      });
    },
    resetBuilder: () => {
      builderForm.resetFields();
      builderForm.setFieldsValue(defaultBuilderValues);
    },
    clearStatement: () => {
      onQueryEdit('');
      form.setFieldsValue({ query: { sql: '' } });
    },
    execute,
  });

  const rangeKey = JSON.stringify(range);
  const previousRange = useRef(rangeKey);
  const syncRange = () => {
    const currentRange = JSON.stringify(form.getFieldValue(['query', 'range']));
    if (previousRange.current !== currentRange) {
      previousRange.current = currentRange;
      workspace.markDirty();
    }
  };
  useEffect(() => {
    syncRange();
  }, [rangeKey, workspace.markDirty]);

  useEffect(() => {
    if (syntax !== 'sql') workspace.enterManual();
  }, [syntax, workspace.enterManual]);

  return {
    ...workspace,
    builderForm,
    contextKey,
    run: async () => {
      syncRange();
      await workspace.run();
    },
    convert: async () => {
      syncRange();
      await workspace.convert();
    },
  };
}

export type DorisQueryWorkspace = ReturnType<typeof useDorisQueryWorkspace>;
