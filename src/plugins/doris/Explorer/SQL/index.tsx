import React, { useState, useContext } from 'react';
import { Resizable } from 're-resizable';
import { useTranslation, Trans } from 'react-i18next';
import { Alert, Button, Form, message, Modal, Space } from 'antd';
import { InfoCircleOutlined, CopyOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';
import { copy2ClipBoard } from '@/utils';
import Meta from '@/components/Meta';
import DocumentDrawer from '@/components/DocumentDrawer';

import { NAME_SPACE, SQL_SIDEBAR_CACHE_KEY, DATE_TYPE_LIST } from '../../constants';
import { getDorisIndex } from '../../services';
import QueryBuilder from './QueryBuilder';
import Content from './Content';

interface Props {
  submode: string;
  disabled?: boolean;
  datasourceValue: number;
  executeQuery: () => void;
}

export default function index(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const form = Form.useFormInstance();
  const { submode, disabled, datasourceValue, executeQuery } = props;
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem(SQL_SIDEBAR_CACHE_KEY) || 200));
  const [executeLoading, setExecuteLoading] = useState(false);
  const [queryWarnModalVisible, setQueryWarnModalVisible] = useState(false);
  const handleExecuteQuery = () => {
    const queryValue = form.getFieldValue(['query', 'query']);
    // 如果 queryValue 里未包含关键字：$__time 或 $__unixEpoch，触发查询时阻断弹窗
    if (!queryValue.includes('$__time') && !queryValue.includes('$__unixEpoch')) {
      setQueryWarnModalVisible(true);
      return;
    }
    executeQuery();
  };

  return (
    <div className='explorer-query-container'>
      <div className='explorer-meta-container rounded-sm'>
        <Resizable
          size={{ width, height: '100%' }}
          enable={{
            right: true,
          }}
          onResizeStop={(e, direction, ref, d) => {
            let curWidth = width + d.width;
            if (curWidth < 200) {
              curWidth = 200;
            }
            setWidth(curWidth);
            localStorage.setItem(SQL_SIDEBAR_CACHE_KEY, curWidth.toString());
          }}
        >
          <Meta
            datasourceCate={DatasourceCateEnum.doris}
            datasourceValue={datasourceValue}
            onTreeNodeClick={(nodeData) => {
              const query = form.getFieldValue(['query']);

              getDorisIndex({ cate: DatasourceCateEnum.doris, datasource_id: datasourceValue, database: nodeData.database, table: nodeData.table })
                .then((res) => {
                  let dateField = 'timestamp';
                  const firstDateField = _.find(res, (item) => {
                    return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
                  })?.field;
                  if (firstDateField) {
                    dateField = firstDateField;
                  }
                  _.set(query, 'query', `select * from ${nodeData.database}.${nodeData.table} WHERE $__timeFilter(${dateField}) limit 20;`);
                  form.setFieldsValue({
                    query,
                  });
                  handleExecuteQuery();
                })
                .catch(() => {
                  message.warning(t('query.get_index_fail'));
                  _.set(query, 'query', `select * from ${nodeData.database}.${nodeData.table} WHERE $__timeFilter(timestamp) limit 20;`);
                  form.setFieldsValue({
                    query,
                  });
                  handleExecuteQuery();
                });
            }}
          />
        </Resizable>
      </div>
      <div
        className='explorer-main'
        style={{
          width: `calc(100% - ${width + 8}px)`,
        }}
      >
        <QueryBuilder
          extra={
            <Button type='primary' onClick={handleExecuteQuery} disabled={disabled} loading={executeLoading}>
              {t('query.execute')}
            </Button>
          }
          executeQuery={handleExecuteQuery}
          datasourceValue={datasourceValue}
          labelInfo={
            <InfoCircleOutlined
              onClick={() => {
                DocumentDrawer({
                  language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                  darkMode,
                  title: t('common:document_link'),
                  type: 'iframe',
                  documentPath: 'https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/',
                });
              }}
            />
          }
          submode={submode}
        />
        <Content submode={submode} setExecuteLoading={setExecuteLoading} />
      </div>
      <Modal
        width={700}
        visible={queryWarnModalVisible}
        footer={[
          <Button
            key='ok'
            onClick={() => {
              setQueryWarnModalVisible(false);
              executeQuery();
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
                      documentPath: `/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/`,
                      anchor: '#时间宏',
                    });
                  }}
                />
              ),
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
