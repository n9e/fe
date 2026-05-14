import React, { useRef, useState, useEffect, useContext } from 'react';
import { Button, Popover, Table, Select, Space } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
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
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [columnsKeys, setColumnsKeys] = useState<string[]>([]);
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
  });
  const [datasourceId, setDatasourceId] = useState<number>(datasourceValue);
  const fetchData = () => {
    if (datasourceId) {
      if (!sql) {
        setData([]);
        setColumnsKeys([]);
        return;
      }
      const parsedRange = parseRange(range);
      const from = moment(parsedRange.start).unix();
      const to = moment(parsedRange.end).unix();
      logQuery({
        cate,
        datasource_id: datasourceId,
        query: [{ sql, database, interval, offset, from, to }],
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

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible, JSON.stringify(range), datasourceId]);

  useEffect(() => {
    setDatasourceId(datasourceValue);
  }, [datasourceValue]);

  return (
    <div ref={divRef}>
      <Popover
        placement='right'
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
          if (!visible) {
            setData([]);
            setColumnsKeys([]);
          }
        }}
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                lineHeight: '32px',
              }}
            >
              {t('common:btn.data_preview')}
            </div>
            <Space>
              <InputGroupWithFormItem label={t('common:datasource.name')}>
                <Select
                  className='w-[200px]'
                  value={datasourceId}
                  onChange={setDatasourceId}
                  options={_.map(groupedDatasourceList[cate], (item) => {
                    return {
                      label: item.name,
                      value: item.id,
                    };
                  })}
                />
              </InputGroupWithFormItem>
              <TimeRangePicker value={range} onChange={setRange} />
            </Space>
          </div>
        }
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
