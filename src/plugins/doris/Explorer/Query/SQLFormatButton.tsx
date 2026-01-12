import React, { useState } from 'react';
import { Button, Modal, Form } from 'antd';
import { useRequest } from 'ahooks';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { parseRange } from '@/components/TimeRangePicker';
import { copy2ClipBoard } from '@/utils';

import { NAME_SPACE } from '../../constants';
import { getDorisSQLFormat, Field } from '../../services';

interface SQLFormatParams {
  rangeRef: React.MutableRefObject<
    | {
        from: number;
        to: number;
      }
    | undefined
  >;
  defaultSearchIndex: Field | undefined;
}

export default function SQLFormatButton(props: SQLFormatParams) {
  const { t } = useTranslation(NAME_SPACE);
  const { rangeRef, defaultSearchIndex } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const form = Form.useFormInstance();
  const { run: fetchFormattedSQL, data } = useRequest(getDorisSQLFormat, {
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
                  lines: 10,
                  offset: 0,
                  reverse: true,
                  default_field: defaultSearchIndex?.field,
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
        okText={t('common:btn.copy')}
        onOk={() => {
          if (data) {
            copy2ClipBoard(data);
            setModalVisible(false);
          }
        }}
      >
        <div className='overflow-x-hidden overflow-y-auto max-h-[400px] break-all'>{data}</div>
      </Modal>
    </>
  );
}
