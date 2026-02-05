import React, { useContext, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import { Form, Modal, Button, Alert, Space } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

import { CommonStateContext } from '@/App';
import { copy2ClipBoard } from '@/utils';
import { setLocalQueryHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';
import { setLocalQueryHistory as setLocalQueryHistoryUtil } from '@/components/HistoricalRecords';
import DocumentDrawer from '@/components/DocumentDrawer';
import { DefaultFormValuesControl, RenderCommonSettings } from '@/pages/logExplorer/types';
import { OnValueFilterParams } from '@/pages/logExplorer/components/LogsViewer/types';
import SideBar from '@/pages/logExplorer/components/SideBar';

import { NAME_SPACE, NG_QUERY_CACHE_KEY, NG_QUERY_CACHE_PICK_KEYS, NG_SQL_CACHE_KEY } from '../constants';
import { Field } from './types';
import { getOrganizeFieldsFromLocalstorage, setOrganizeFieldsToLocalstorage } from './utils/organizeFieldsLocalstorage';

import SideBarNav from './SideBarNav';
import Main from './Main';

import './style.less';

interface Props {
  tabKey: string;
  disabled?: boolean;
  defaultFormValuesControl?: DefaultFormValuesControl;
  renderCommonSettings: RenderCommonSettings;
}

export default function index(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const { tabKey, disabled, defaultFormValuesControl, renderCommonSettings } = props;
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue');
  const stackByField = Form.useWatch(['query', 'stackByField']);
  const defaultSearchField = Form.useWatch(['query', 'defaultSearchField']);

  const [organizeFields, setOrganizeFields] = useState<string[]>([]);
  const [indexData, setIndexData] = useState<Field[]>([]);
  const [queryWarnModalVisible, setQueryWarnModalVisible] = useState(false);

  const executeQuery = (force = false) => {
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
      });
    }, 0);
  };

  const handleSetStackByField = (index) => {
    form.setFieldsValue({
      query: {
        stackByField: index,
      },
    });
  };

  const handleSetDefaultSearchField = (index) => {
    form.setFieldsValue({
      query: {
        defaultSearchField: index,
      },
    });
  };

  const handleValueFilter = (params: OnValueFilterParams) => {
    const assignmentOperator = params.assignmentOperator || ':';
    const values = form.getFieldsValue();
    const query = values.query;
    let queryStr = _.trim(query.query);
    if (queryStr === '*') {
      queryStr = '';
    }
    if (params.operator === 'AND') {
      queryStr += `${queryStr === '' ? '' : ' AND'} ${params.key}${assignmentOperator}"${params.value}"`;
    }
    if (params.operator === 'NOT') {
      queryStr += `${queryStr === '' ? ' NOT' : ' AND NOT'} ${params.key}${assignmentOperator}"${params.value}"`;
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
      setOrganizeFields(
        getOrganizeFieldsFromLocalstorage({
          datasourceValue,
          database: queryValues?.database,
          table: queryValues?.table,
        }),
      );
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
                      documentPath: `https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/`,
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
