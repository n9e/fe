import React, { useState } from 'react';
import { Button, Modal, Form, Tooltip, Alert } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

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
        {t('query.sql_format')}
      </Button>
      <Modal
        title={t('query.sql_format')}
        visible={modalVisible}
        width={800}
        onCancel={() => {
          setModalVisible(false);
        }}
        footer={null}
      >
        <Alert type='info' message='字段最大值、最小值、分位值等复杂 SQL ，可在左侧字段列表上点击查看。' />
        <div className='mb-2'>
          <div className='mb-2 flex items-center gap-2'>
            <a
              className='flex-shrink-0'
              onClick={() => {
                setModalVisible(false);
                onClick({
                  submode: 'raw',
                  query: data?.origin,
                });
              }}
            >
              查看日志原文
            </a>
            <Tooltip title={data?.origin}>
              <div className='flex-1 truncate'>{data?.origin}</div>
            </Tooltip>
            <CopyOutlined
              className='flex-shrink-0'
              onClick={() => {
                copy2ClipBoard(data?.origin || '');
              }}
            />
          </div>
        </div>
        <div className='mb-2'>
          <div className='mb-2 flex items-center gap-2'>
            <a
              className='flex-shrink-0'
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
              查看时序图
            </a>
            <Tooltip title={data?.timeseries?.count?.sql}>
              <div className='flex-1 truncate'>{data?.timeseries?.count?.sql}</div>
            </Tooltip>
            <CopyOutlined
              className='flex-shrink-0'
              onClick={() => {
                copy2ClipBoard(data?.timeseries?.count?.sql || '');
              }}
            />
          </div>
        </div>
        <div className='mb-2'>
          <div className='mb-2 flex items-center gap-2'>
            <a
              className='flex-shrink-0'
              onClick={() => {
                setModalVisible(false);
                onClick({
                  submode: 'raw',
                  query: data?.table?.sql,
                });
              }}
            >
              查看统计值
            </a>
            <Tooltip title={data?.table?.sql}>
              <div className='flex-1 truncate'>{data?.table?.sql}</div>
            </Tooltip>
            <CopyOutlined
              className='flex-shrink-0'
              onClick={() => {
                copy2ClipBoard(data?.table?.sql || '');
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
