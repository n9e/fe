import React, { useContext, useState } from 'react';
import { Button, Form, Modal } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { CommonStateContext } from '@/App';
import { parseRange } from '@/components/TimeRangePicker';
import { copy2ClipBoard } from '@/utils';

import { NAME_SPACE } from '../../constants';
import { getCKSQLFormat } from '../../services';

interface SQLFormatParams {
  rangeRef: React.MutableRefObject<{ from: number; to: number } | undefined>;
  defaultSearchField?: string;
  onClick: (values: any) => void;
}

export default function SQLFormatButton(props: SQLFormatParams) {
  const { t } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const { rangeRef, onClick } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const form = Form.useFormInstance();
  const { run: fetchFormattedSQL, data } = useRequest(getCKSQLFormat, {
    manual: true,
    onSuccess: () => setModalVisible(true),
  });

  return (
    <>
      <Button
        onClick={() => {
          const datasourceValue = form.getFieldValue('datasourceValue');
          const queryValues = form.getFieldValue('query');
          const range = queryValues?.range ? parseRange(queryValues.range) : undefined;
          const timeParams =
            rangeRef.current ||
            (range
              ? {
                  from: moment(range.start).unix(),
                  to: moment(range.end).unix(),
                }
              : undefined);
          if (!datasourceValue || !queryValues?.database || !queryValues?.table || !queryValues?.time_field || !timeParams) return;

          fetchFormattedSQL({
            cate: 'ck',
            datasource_id: datasourceValue,
            query: [
              {
                database: queryValues.database,
                table: queryValues.table,
                time_field: queryValues.time_field,
                query_builder_filter: queryValues.query_builder_filter,
                from: timeParams.from,
                to: timeParams.to,
                lines: 10,
                offset: 0,
                reverse: true,
              },
            ],
          });
        }}
      >
        {t('query.sql_format.title')}
      </Button>
      <Modal title={t('query.sql_format.title')} visible={modalVisible} width={800} onCancel={() => setModalVisible(false)} footer={null}>
        <div className='flex items-center justify-between mb-2'>
          <a
            onClick={() => {
              setModalVisible(false);
              onClick({ syntax: 'sql', sqlVizType: 'table', sql: data });
            }}
          >
            {t('query.sql_format.origin')}
          </a>
          <CopyOutlined onClick={() => copy2ClipBoard(data || '')} />
        </div>
        <SyntaxHighlighter
          wrapLongLines
          customStyle={{ maxHeight: 320, overflow: 'auto', background: 'var(--fc-fill-3)' }}
          children={data || ''}
          language='sql'
          PreTag='div'
          style={darkMode ? dark : undefined}
        />
      </Modal>
    </>
  );
}
