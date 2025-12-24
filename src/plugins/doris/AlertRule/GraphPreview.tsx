import React, { useRef, useState } from 'react';
import { Button, Popover, Table } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import getTextWidth from '@/utils/getTextWidth';

import { logQuery } from '../services';
import { getFields } from '../utils';

export default function GraphPreview({
  cate,
  datasourceValue,
  sql,
  database,
  interval,
  offset,
}: {
  cate: string;
  datasourceValue: number;
  sql: string;
  database?: string;
  interval?: number;
  offset?: string;
}) {
  const { t } = useTranslation('db_doris');
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [columnsKeys, setColumnsKeys] = useState<string[]>([]);
  const fetchData = () => {
    if (datasourceValue) {
      logQuery({
        cate,
        datasource_id: datasourceValue,
        query: [{ sql, database, interval, offset }],
      })
        .then((res) => {
          setData(res.list || []);
          setColumnsKeys(getFields(res?.list, sql));
        })
        .catch(() => {
          setData([]);
          setColumnsKeys([]);
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
        title={t('common:btn.data_preview')}
        content={
          <div style={{ width: 980 }}>
            <Table
              size='small'
              tableLayout='auto'
              scroll={{ x: 'max-content', y: 500 }}
              dataSource={data}
              columns={_.map(columnsKeys, (key) => {
                return {
                  title: key,
                  dataIndex: key,
                  key: key,
                  render(value) {
                    return (
                      <div
                        style={{
                          minWidth: getTextWidth(key) + 20,
                        }}
                      >
                        {value}
                      </div>
                    );
                  },
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
          {t('common:btn.data_preview')}
        </Button>
      </Popover>
    </div>
  );
}
