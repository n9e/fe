import React, { useRef, useState } from 'react';
import { Button, Popover, Table } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { logQuery } from '../services';
import { getFields } from '../utils';

export default function GraphPreview({ cate, datasourceValue, sql, keys, database }) {
  const { t } = useTranslation('db_aliyunSLS');
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [columnsKeys, setColumnsKeys] = useState<string[]>([]);
  const fetchData = () => {
    if (datasourceValue) {
      logQuery({
        cate,
        datasource_id: datasourceValue,
        query: [{ sql, database, keys }],
      }).then((res) => {
        setData(res.list || []);
        setColumnsKeys(getFields(res?.list, sql));
      });
    }
  };

  return (
    <div ref={divRef}>
      <Popover
        placement='right'
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
        }}
        title={t('preview')}
        content={
          <div style={{ width: 700 }}>
            <Table
              size='small'
              tableLayout='auto'
              scroll={{ x: 700, y: 300 }}
              dataSource={data}
              columns={_.map(columnsKeys, (key) => {
                return {
                  title: key,
                  dataIndex: key,
                  key: key,
                  className: 'alert-rule-sls-preview-table-column',
                };
              })}
            />
          </div>
        }
        trigger='click'
        getPopupContainer={() => divRef.current || document.body}
      >
        <Button
          size='small'
          type='primary'
          ghost
          onClick={() => {
            if (!visible) {
              fetchData();
              setVisible(true);
            }
          }}
        >
          {t('preview')}
        </Button>
      </Popover>
    </div>
  );
}
