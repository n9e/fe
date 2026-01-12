import React, { useContext, useState } from 'react';
import { Button, Modal, Form, Alert, Space } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { CommonStateContext } from '@/App';
import { parseRange } from '@/components/TimeRangePicker';
import { copy2ClipBoard } from '@/utils';

import { NAME_SPACE } from '../../../constants';
import { getDorisSQLsPreview } from '../../../services';

interface SQLFormatParams {
  rangeRef: React.MutableRefObject<
    | {
        from: number;
        to: number;
      }
    | undefined
  >;
  defaultSearchField: string | undefined;
  onClick: (values: any) => void;
}

export default function SQLFormatButton(props: SQLFormatParams) {
  const { t } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const { rangeRef, defaultSearchField, onClick } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const form = Form.useFormInstance();
  const { run: fetchFormattedSQL, data } = useRequest(getDorisSQLsPreview, {
    manual: true,
    onSuccess: () => {
      setModalVisible(true);
    },
  });

  return (
    <>
      <Button
        onClick={() => {
          const datasourceValue = form.getFieldValue('datasourceValue');
          const queryValues = form.getFieldValue('query');
          let timeParams = rangeRef.current;
          if (!timeParams) {
            const range = parseRange(queryValues.range);
            timeParams = {
              from: moment(range.start).unix(),
              to: moment(range.end).unix(),
            };
          }
          if (datasourceValue && queryValues?.database && queryValues?.table && queryValues?.time_field && timeParams) {
            fetchFormattedSQL({
              cate: 'doris',
              datasource_id: datasourceValue,
              query: [
                {
                  database: queryValues.database,
                  table: queryValues.table,
                  time_field: queryValues.time_field,
                  query: queryValues.query,
                  from: timeParams.from,
                  to: timeParams.to,
                  default_field: defaultSearchField,

                  func: 'count', // 特殊 func 只用于 query 模式预览 SQL
                },
              ],
            });
          }
        }}
      >
        {t('query.sql_format.title')}
      </Button>
      <Modal
        title={t('query.sql_format.title')}
        visible={modalVisible}
        width={800}
        onCancel={() => {
          setModalVisible(false);
        }}
        footer={null}
      >
        <Alert showIcon className='mb-4' type='info' message={t('query.sql_format.tip')} />
        <div className='mb-4'>
          <div>
            <Space>
              <a
                onClick={() => {
                  setModalVisible(false);
                  onClick({
                    submode: 'raw',
                    query: data?.origin,
                  });
                }}
              >
                {t('query.sql_format.origin')}
              </a>
              <CopyOutlined
                className='flex-shrink-0'
                onClick={() => {
                  copy2ClipBoard(data?.origin || '');
                }}
              />
            </Space>
          </div>
          <SyntaxHighlighter
            wrapLongLines
            customStyle={{
              maxHeight: 100,
              overflow: 'auto',
              background: 'var(--fc-fill-3)',
            }}
            children={data?.origin}
            language='sql'
            PreTag='div'
            style={darkMode ? dark : undefined}
          />
        </div>
        <div className='mb-4'>
          <div>
            <Space>
              <a
                onClick={() => {
                  setModalVisible(false);
                  onClick({
                    submode: 'timeSeries',
                    query: data?.timeseries?.count?.sql,
                    keys: {
                      valueKey: data?.timeseries?.count?.value_key,
                      labelKey: data?.timeseries?.count?.label_key,
                    },
                  });
                }}
              >
                {t('query.sql_format.timeseries')}
              </a>
              <CopyOutlined
                className='flex-shrink-0'
                onClick={() => {
                  copy2ClipBoard(data?.timeseries?.count?.sql || '');
                }}
              />
            </Space>
          </div>
          <SyntaxHighlighter
            wrapLongLines
            customStyle={{
              maxHeight: 100,
              overflow: 'auto',
              background: 'var(--fc-fill-3)',
            }}
            children={data?.timeseries?.count?.sql}
            language='sql'
            PreTag='div'
            style={darkMode ? dark : undefined}
          />
        </div>
        <div className='mb-2'>
          <div>
            <Space>
              <a
                onClick={() => {
                  setModalVisible(false);
                  onClick({
                    submode: 'raw',
                    query: data?.table?.sql,
                  });
                }}
              >
                {t('query.sql_format.table')}
              </a>
              <CopyOutlined
                className='flex-shrink-0'
                onClick={() => {
                  copy2ClipBoard(data?.table?.sql || '');
                }}
              />
            </Space>
          </div>
          <SyntaxHighlighter
            wrapLongLines
            customStyle={{
              maxHeight: 100,
              overflow: 'auto',
              background: 'var(--fc-fill-3)',
            }}
            children={data?.table?.sql}
            language='sql'
            PreTag='div'
            style={darkMode ? dark : undefined}
          />
        </div>
      </Modal>
    </>
  );
}
