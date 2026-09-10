import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import { Form, Modal, Button, Alert, Space } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

import { CommonStateContext } from '@/App';
import { IS_ENT } from '@/utils/constant';
import { IRawTimeRange, timeRangeUnix } from '@/components/TimeRangePicker';
import AiQueryDock from '@/components/AiQueryDock';
import { AiQueryDockTrigger } from '@/components/AiQueryDock/Trigger';
import { useQueryDockActions, QueryDockAction, QueryDockControl, QueryDockSnapshot } from '@/components/AiQueryDock/useQueryDockActions';
import { usePendingQuery } from '@/components/AiQueryDock/usePendingQuery';
import { buildPageFrom } from '@/components/AiChatNG/recommend';
import { NAME_SPACE as AI_CHAT_NS } from '@/components/AiChatNG/constants';
import { copy2ClipBoard } from '@/utils';
import { setLocalQueryHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';
import { setLocalQueryHistory as setLocalQueryHistoryUtil } from '@/components/HistoricalRecords';
import DocumentDrawer from '@/components/DocumentDrawer';
import { DefaultFormValuesControl, RenderCommonSettings } from '@/pages/logExplorer/types';
import { OnValueFilterParams } from '@/pages/logExplorer/components/LogsViewer/types';
import SideBar from '@/pages/logExplorer/components/SideBar';

import { NAME_SPACE, NG_QUERY_CACHE_KEY, NG_QUERY_CACHE_PICK_KEYS, NG_SQL_CACHE_KEY, DORIS_SQL_MODE_DOC_URL } from '../constants';
import { Field } from './types';
import { getOrganizeFieldsFromLocalstorage, setOrganizeFieldsToLocalstorage } from './utils/organizeFieldsLocalstorage';

import SideBarNav from './SideBarNav';
import Main from './Main';

import './style.less';

// How this panel's statement is named to the assistant. Only the SQL syntax
// hosts the dock: the search syntax is a structured filter, not a statement.
const LOG_SQL_ACTION: QueryDockAction = {
  name: 'set_log_query',
  argument: 'sql',
  language: 'Doris SQL statement',
  followUpExample: '只看 ERROR 级别',
  page: { title: 'Log explorer', summary: 'The user writes SQL against a Doris log table and reads the rows it returns.' },
};
interface LogSQLSnapshot extends QueryDockSnapshot {
  range?: IRawTimeRange;
}

interface Props {
  tabKey: string;
  disabled?: boolean;
  defaultFormValuesControl?: DefaultFormValuesControl;
  renderCommonSettings: RenderCommonSettings;
}

export default function index(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { t: tAi } = useTranslation(AI_CHAT_NS);
  const { darkMode } = useContext(CommonStateContext);
  const { tabKey, disabled, defaultFormValuesControl, renderCommonSettings } = props;
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue');
  const stackByField = Form.useWatch(['query', 'stackByField']);
  const defaultSearchField = Form.useWatch(['query', 'defaultSearchField']);

  const [organizeFields, setOrganizeFields] = useState<string[]>([]);
  const [indexData, setIndexData] = useState<Field[]>([]);
  const [queryWarnModalVisible, setQueryWarnModalVisible] = useState(false);
  const syntax = Form.useWatch(['query', 'syntax']);
  const [aiOpen, setAiOpen] = useState(false);
  // Every hand the user lays on the panel bumps this; a dock turn that started
  // on an older revision may not write, and its undo is gone.
  const revisionRef = useRef(0);
  const lastFilledRef = useRef<string>();
  const pending = usePendingQuery();
  const queryBoxRef = useRef<HTMLDivElement>(null);
  const queryButtonRef = useRef<HTMLButtonElement>(null);
  const control = useRef<QueryDockControl<LogSQLSnapshot> | null>(null);
  const aiActions = useQueryDockActions({
    enabled: IS_ENT && aiOpen && syntax === 'sql',
    datasourceValue,
    getControl: () => control.current,
    action: LOG_SQL_ACTION,
  });
  const invalidate = () => {
    revisionRef.current += 1;
    pending.clear();
    aiActions.invalidateUndo();
  };

  // What a validated query does once it may run: remember it, then refresh.
  const commitQuery = (values) => {
    const queryValues = values.query;
    // 设置 tabs 缓存值
    if (defaultFormValuesControl?.setDefaultFormValues) {
      defaultFormValuesControl.setDefaultFormValues({
        datasourceCate: values.datasourceCate,
        datasourceValue: values.datasourceValue,
        query: values.query,
      });
    }

    // 设置历史记录方法
    if (queryValues.syntax === 'query') {
      if (queryValues.database && queryValues.table && queryValues.time_field) {
        setLocalQueryHistory(`${NG_QUERY_CACHE_KEY}-${datasourceValue}`, _.pick(queryValues, NG_QUERY_CACHE_PICK_KEYS));
      }
    } else if (queryValues.syntax === 'sql') {
      if (queryValues.sql) {
        setLocalQueryHistoryUtil(`${NG_SQL_CACHE_KEY}-${datasourceValue}`, queryValues.sql);
      }
    }

    form.setFieldsValue({
      refreshFlag: _.uniqueId('refreshFlag_'),
    });
  };

  const executeQuery = (force = false) => {
    invalidate();
    // setFieldsValue 是异步执行，但是 validateFields 是同步的，所以用 setTimeout 把 validateFields 放到下一个事件循环中执行
    setTimeout(() => {
      form.validateFields().then((values) => {
        const queryValues = values.query;

        // 如果是 sql 模式 sql值 里未包含关键字：$__time 或 $__unixEpoch，触发查询时阻断弹窗
        const sqlValue = queryValues.sql || '';
        // typeof force === 'boolean' 是为了防止非布尔值传入时报错
        if (typeof force === 'boolean' && !force && queryValues.syntax === 'sql' && !sqlValue.includes('$__time') && !sqlValue.includes('$__unixEpoch')) {
          setQueryWarnModalVisible(true);
          return;
        }
        commitQuery(values);
      });
    }, 0);
  };

  // What the dock sends with each message: the data source, the statement in
  // the box, the window, and the table the sidebar has picked.
  const readAiPageFrom = useCallback(() => {
    const snapshot = control.current?.snapshot();
    const range = snapshot?.range?.start && snapshot.range.end ? timeRangeUnix(snapshot.range) : undefined;
    const query = form.getFieldValue('query') || {};
    return buildPageFrom({
      param: {
        datasource_type: 'doris',
        datasource_id: datasourceValue,
        query: snapshot?.query?.trim() || undefined,
        start: range ? String(range.start) : undefined,
        end: range ? String(range.end) : undefined,
        query_parameters: _.pickBy(
          { syntax: query.syntax, database: query.database, table: query.table, time_field: query.time_field },
          (value) => typeof value === 'string' && value !== '',
        ),
      },
    });
  }, [datasourceValue]);
  const aiPromptList = useMemo(
    () => ['errors', 'per_minute', 'group'].map((topic) => ({ label: tAi(`dock.prompt_log_${topic}`), value: tAi(`dock.prompt_log_${topic}_query`) })),
    [tAi],
  );

  useLayoutEffect(() => {
    control.current = {
      snapshot: () => ({ query: form.getFieldValue(['query', 'sql']) || '', range: _.cloneDeep(form.getFieldValue(['query', 'range'])) }),
      revision: () => revisionRef.current,
      fill: (sql, range) => {
        pending.abort();
        lastFilledRef.current = sql;
        // Rows are the honest view of a statement; the time series view needs
        // value columns the assistant never chose.
        form.setFieldsValue({ query: range ? { sql, range, sqlVizType: 'table' } : { sql, sqlVizType: 'table' } });
      },
      run: ({ signal } = {}) => {
        const sql: string = form.getFieldValue(['query', 'sql']) || '';
        if (!sql.trim() || !datasourceValue) return Promise.reject(new Error('A query and data source are required'));
        // The page refuses to run an unbounded scan; say so instead of popping its modal.
        if (!sql.includes('$__time') && !sql.includes('$__unixEpoch')) {
          return Promise.reject(new Error('The statement must bound time with $__timeFilter(<time column>) or $__unixEpochFilter(<time column>)'));
        }
        return form
          .validateFields()
          .catch(() => {
            throw new Error('The page rejected the query form');
          })
          .then((values) => {
            const promise = pending.begin(signal);
            commitQuery(values);
            return promise;
          });
      },
      restore: (snapshot) => {
        pending.abort();
        lastFilledRef.current = snapshot.query;
        form.setFieldsValue({ query: { sql: snapshot.query, range: snapshot.range }, refreshFlag: _.uniqueId('refreshFlag_') });
      },
      queryInput: () => queryBoxRef.current,
      queryButton: () => queryButtonRef.current,
    };
    return () => {
      control.current = null;
    };
  });

  const dock = IS_ENT ? (
    <AiQueryDock
      open={aiOpen}
      pageFrom={readAiPageFrom}
      progress={aiActions.progress}
      prepareTurn={aiActions.prepareTurn}
      canUndo={aiActions.canUndo}
      onUndo={aiActions.undo}
      promptList={aiPromptList}
      resultNoun='rows'
      placeholder={tAi('dock.placeholder_first_sql')}
      onNewConversation={aiActions.reset}
      onClose={() => {
        aiActions.cancel();
        setAiOpen(false);
      }}
    />
  ) : undefined;

  const handleSetStackByField = (index?: string) => {
    form.setFieldsValue({
      refreshFlag: undefined,
      query: {
        stackByField: index,
      },
    });
    executeQuery();
  };

  const handleSetDefaultSearchField = (index) => {
    form.setFieldsValue({
      query: {
        defaultSearchField: index,
      },
    });
  };

  const handleValueFilter = (params: OnValueFilterParams) => {
    // params.key 是日志行 flatten 后的名字，可能是 fctags.dirname 这类非表字段；indexName 才是真实字段。
    // 两者不一致说明点中的值只是该字段值里的一个片段，只能用 ":" 做内容匹配，"=" 永远匹配不到。
    const filterKey = params.indexName || params.key;
    const isFragmentOfField = _.toLower(filterKey) !== _.toLower(params.key);
    const assignmentOperator = isFragmentOfField ? ':' : params.assignmentOperator || ':';
    const values = form.getFieldsValue();
    const query = values.query;
    let queryStr = _.trim(query.query);
    if (queryStr === '*') {
      queryStr = '';
    }
    if (params.value === null) {
      if (params.operator === 'AND') {
        queryStr += `${queryStr === '' ? '' : ' AND'} ${filterKey} IS NULL`;
      }
      if (params.operator === 'NOT') {
        queryStr += `${queryStr === '' ? '' : ' AND'} ${filterKey} IS NOT NULL`;
      }
    } else {
      let escapedValue = params.value;
      if (_.isString(params.value)) {
        // 对 fieldValue 里面的双引号进行转义
        escapedValue = _.replace(params.value, /"/g, '\\"');
      }
      if (params.operator === 'AND') {
        queryStr += `${queryStr === '' ? '' : ' AND'} ${filterKey}${assignmentOperator}"${escapedValue}"`;
      }
      if (params.operator === 'NOT') {
        queryStr += `${queryStr === '' ? ' NOT' : ' AND NOT'} ${filterKey}${assignmentOperator}"${escapedValue}"`;
      }
    }
    form.setFieldsValue({
      refreshFlag: undefined,
      query: {
        syntax: 'query',
        query: queryStr,
      },
    });
    executeQuery();
  };

  useEffect(() => {
    if (defaultFormValuesControl?.isInited) {
      const datasourceValue = form.getFieldValue('datasourceValue');
      const queryValues = form.getFieldValue('query');

      // 优先使用 URL 传入的 organizeFields
      const urlOrganizeFields = queryValues?.organizeFields;
      if (urlOrganizeFields && _.isArray(urlOrganizeFields) && urlOrganizeFields.length > 0) {
        setOrganizeFields(urlOrganizeFields);
        setOrganizeFieldsToLocalstorage(
          {
            datasourceValue,
            database: queryValues?.database,
            table: queryValues?.table,
          },
          urlOrganizeFields,
        );
      } else {
        setOrganizeFields(
          getOrganizeFieldsFromLocalstorage({
            datasourceValue,
            database: queryValues?.database,
            table: queryValues?.table,
          }),
        );
      }
    }
  }, [defaultFormValuesControl?.isInited]);

  return (
    <>
      <div className={`h-full ${NAME_SPACE}-explorer-container`}>
        <Form.Item name='refreshFlag' hidden>
          <div />
        </Form.Item>
        <Form.Item name={['query', 'stackByField']} hidden>
          <div />
        </Form.Item>
        <Form.Item name={['query', 'defaultSearchField']} hidden>
          <div />
        </Form.Item>
        <div className='h-full flex'>
          <SideBar ns={NAME_SPACE}>
            {renderCommonSettings({
              getDefaultQueryValues: (queryValues: Record<string, any>) => {
                return {
                  navMode: queryValues.navMode || 'fields',
                  syntax: queryValues.syntax || 'query',
                  sqlVizType: queryValues.sqlVizType || 'table',
                };
              },
              executeQuery,
            })}
            <SideBarNav
              disabled={disabled}
              datasourceValue={datasourceValue}
              executeQuery={executeQuery}
              organizeFields={organizeFields} // 使用到了 query 的 organizeFields
              setOrganizeFields={(value, setLocalstorage = true) => {
                const queryValues = form.getFieldValue('query');
                // 初始化时从本地获取，query、sql 都有可能设置
                setOrganizeFields(value);
                // 字段列表选择 "显示字段" 时更新本地缓存，这里只更新 query 模式的，sql 模式是在右侧表格设置项里设置的
                if (setLocalstorage) {
                  setOrganizeFieldsToLocalstorage(
                    {
                      datasourceValue,
                      database: queryValues?.database,
                      table: queryValues?.table,
                    },
                    value,
                  );
                }
              }}
              onIndexDataChange={setIndexData}
              handleValueFilter={handleValueFilter}
              stackByField={stackByField}
              setStackByField={handleSetStackByField}
              defaultSearchField={defaultSearchField}
              setDefaultSearchField={handleSetDefaultSearchField}
            />
          </SideBar>
          <div className='min-w-0 flex-1'>
            <Main
              tabKey={tabKey}
              datasourceValue={datasourceValue}
              indexData={indexData}
              organizeFields={organizeFields}
              setOrganizeFields={(value) => {
                const queryValues = form.getFieldValue('query');
                setOrganizeFields(value);
                setOrganizeFieldsToLocalstorage(
                  {
                    datasourceValue,
                    database: queryValues?.database,
                    table: queryValues?.table,
                  },
                  value,
                );
              }}
              executeQuery={executeQuery}
              handleValueFilter={handleValueFilter}
              stackByField={stackByField}
              setStackByField={handleSetStackByField}
              defaultSearchField={defaultSearchField}
              setDefaultSearchField={handleSetDefaultSearchField}
              queryExtra={
                IS_ENT ? (
                  <AiQueryDockTrigger
                    open={aiOpen}
                    onClick={() => {
                      if (aiOpen) aiActions.cancel();
                      setAiOpen((previous) => !previous);
                    }}
                  />
                ) : undefined
              }
              noticeBanner={dock}
              queryBoxRef={queryBoxRef}
              queryButtonRef={queryButtonRef}
              queryRequest={pending.queryRequest}
              onQueryEdit={(sql) => {
                // The assistant writing is not the user taking over.
                if (sql !== lastFilledRef.current) invalidate();
              }}
            />
          </div>
        </div>
      </div>
      <Modal
        width={700}
        visible={queryWarnModalVisible}
        footer={[
          <Button
            key='ok'
            onClick={() => {
              setQueryWarnModalVisible(false);
              executeQuery(true);
            }}
          >
            {t('query.warn_message_btn_1')}
          </Button>,
          <Button
            key='cancel'
            type='primary'
            onClick={() => {
              setQueryWarnModalVisible(false);
            }}
          >
            {t('query.warn_message_btn_2')}
          </Button>,
        ]}
        onCancel={() => setQueryWarnModalVisible(false)}
      >
        <Alert className='mt-4 mb-4' type='warning' showIcon message={t('query.warn_message')} />
        <div className='mb-4'>{t('query.warn_message_content_1')}</div>
        <div className='mb-2'>{t('query.warn_message_content_2')}</div>
        <div className='mb-2'>
          <div>
            <Space>
              <code>{`$__timeFilter(dateColumn)`}</code>
              <CopyOutlined
                onClick={() => {
                  copy2ClipBoard(`$__timeFilter(dateColumn)`);
                }}
              />
            </Space>
          </div>
          <div>
            <Space>
              <code>{`$__unixEpochFilter(dateColumn) `}</code>
              <CopyOutlined
                onClick={() => {
                  copy2ClipBoard(`$__unixEpochFilter(dateColumn) `);
                }}
              />
            </Space>
          </div>
          <div>
            <Space>
              <code>{`$__unixEpochNanoFilter(dateColumn)`}</code>
              <CopyOutlined
                onClick={() => {
                  copy2ClipBoard(`$__unixEpochNanoFilter(dateColumn)`);
                }}
              />
            </Space>
          </div>
        </div>
        <div className='mb-2'>
          {t('query.warn_message_content_3')}
          <Space>
            <code>
              {`SELECT count(*) as count FROM db_name.table_name `}
              <span
                style={{
                  color: 'var(--fc-orange-5-color)',
                }}
              >{`WHERE $__timeFilter(timestamp) `}</span>
            </code>
            <CopyOutlined
              onClick={() => {
                copy2ClipBoard(`SELECT count(*) as count FROM db_name.table_name WHERE $__timeFilter(timestamp)`);
              }}
            />
          </Space>
        </div>
        <div>
          <Trans
            ns={NAME_SPACE}
            i18nKey='query.warn_message_content_4'
            components={{
              a: (
                <a
                  onClick={() => {
                    DocumentDrawer({
                      language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                      darkMode,
                      title: t('common:document_link'),
                      type: 'iframe',
                      documentPath: DORIS_SQL_MODE_DOC_URL,
                      anchor: '#2-时间宏',
                    });
                  }}
                />
              ),
            }}
          />
        </div>
      </Modal>
    </>
  );
}
