import React, { useState, useRef, useEffect } from 'react';
import { Button, Popover, Form, Table } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { normalizeTime } from '../../utils';
import { getLogsQuery } from '../services';

interface IProps {
  datasourceValue: number;
  disabled?: boolean;
}

export default function GraphPreview({ datasourceValue, disabled }: IProps) {
  const { t } = useTranslation('alertRules');
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
  });
  const [data, setData] = useState<any[]>([]);
  const [columnsKeys, setColumnsKeys] = useState<string[]>([]);
  const queries = Form.useWatch(['extra_config', 'enrich_queries']);
  const cate = Form.useWatch('cate');
  const fetchSeries = () => {
    const parsedRange = parseRange(range);
    const start = moment(parsedRange.start).unix();
    const end = moment(parsedRange.end).unix();
    getLogsQuery({
      cate,
      datasource_id: datasourceValue,
      query: _.map(queries, (item) => {
        return {
          index: item.index,
          filter: item.filter,
          value: item.value,
          group_by: item.group_by,
          date_field: item.date_field,
          interval: normalizeTime(item.interval, item.interval_unit),
          start,
          end,
        };
      }),
    })
      .then((res) => {
        setData(res?.list || []);
        setColumnsKeys(_.keys(res?.list?.[0]?._source));
      })
      .catch(() => {
        setData([]);
        setColumnsKeys([]);
      });
  };

  useEffect(() => {
    if (visible) {
      fetchSeries();
    }
  }, [JSON.stringify(range)]);

  return (
    <div ref={divRef}>
      <Popover
        placement='bottomLeft'
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
        }}
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                lineHeight: '32px',
              }}
            >
              {t('datasource:es.alert.query.preview')}
            </div>
            <div>
              <TimeRangePicker value={range} onChange={setRange} />
            </div>
          </div>
        }
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
                  className: 'alert-rule-es-preview-table-column',
                  render: (_text, record) => {
                    let val = _.get(record, ['_source', key]);
                    if (_.isPlainObject(val)) {
                      val = JSON.stringify(val);
                    }
                    return <div>{val}</div>;
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
              fetchSeries();
              setVisible(true);
            }
          }}
          disabled={disabled}
        >
          {t('datasource:es.alert.query.preview')}
        </Button>
      </Popover>
    </div>
  );
}
