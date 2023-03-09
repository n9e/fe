import React, { useRef, useState } from 'react';
import { Button, Popover, Table } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { getSLSLogs } from '@/services/metric';
import { parseRange } from '@/components/TimeRangePicker';

export default function GraphPreview({ form }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const fetchData = () => {
    const cate = form.getFieldValue('cate');
    const cluster = form.getFieldValue('cluster');
    const queries = form.getFieldValue('queries');
    if (!_.isEmpty(cluster)) {
      getSLSLogs({
        cate,
        cluster: _.join(cluster, ' '),
        query: _.map(queries, (q) => {
          const parsedRange = parseRange(q.range);
          const from = moment(parsedRange.start).unix();
          const to = moment(parsedRange.end).unix();
          return {
            project: q.project,
            logstore: q.logstore,
            query: q.query,
            power_sql: q.power_sql,
            from,
            to,
            lines: 100,
            offset: 0,
            reverse: false,
          };
        }),
      }).then((res) => {
        setData(res.list);
      });
    }
  };

  return (
    <div style={{ marginBottom: 16 }} ref={divRef}>
      <Popover
        placement='right'
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
        }}
        title='数据预览'
        content={
          <div style={{ width: 700 }}>
            <Table
              size='small'
              tableLayout='auto'
              scroll={{ x: 700, y: 300 }}
              dataSource={data}
              columns={_.map(data[0], (_val, key) => {
                return {
                  title: key,
                  dataIndex: key,
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
          type='primary'
          onClick={() => {
            if (!visible) {
              fetchData();
              setVisible(true);
            }
          }}
        >
          数据预览
        </Button>
      </Popover>
    </div>
  );
}
