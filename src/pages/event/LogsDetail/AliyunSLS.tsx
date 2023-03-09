import React, { useState, useEffect } from 'react';
import { Drawer, Space, Input, Select } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getEventLogQuery } from '@/services/warning';
import ModalHOC, { ModalWrapProps } from '@/pages/dashboard/Components/ModalHOC';
import RawTable from '@/pages/explorer/AliyunSLS/RawTable';
import './style.less';

interface IProps {
  id: string;
  start: number;
  end: number;
}

function index(props: IProps & ModalWrapProps) {
  const { id, start, end, visible, destroy } = props;
  const [range, setRange] = useState<IRawTimeRange>({
    start: moment.unix(start),
    end: moment.unix(end),
  });
  const [limit, setLimit] = useState(10);
  const [fields, setFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [data, setData] = useState<
    {
      [key: string]: string;
    }[]
  >([]);

  useEffect(() => {
    const parsedRange = parseRange(range);
    const start = moment(parsedRange.start).unix();
    const end = moment(parsedRange.end).unix();
    getEventLogQuery({
      event_id: Number(id),
      start,
      end,
      limit,
    }).then((res) => {
      let allFields: string[] = [];
      const newData = _.map(res.dat, (item) => {
        console.log('item', item);
        const keys = _.keys(item);
        allFields = _.union(_.concat(allFields, keys));
        return item;
      });
      setFields(allFields);
      setData(newData);
    });
  }, [id, JSON.stringify(range), limit]);

  return (
    <Drawer title='日志详情' width={960} placement='right' onClose={destroy} visible={visible}>
      <div style={{ marginBottom: 10 }}>
        <Space>
          <TimeRangePicker dateFormat='YYYY-MM-DD HH:mm:ss' value={range} onChange={setRange} />
          <Input.Group>
            <span className='ant-input-group-addon'>结果数</span>
            <Select
              value={limit}
              onChange={(val) => {
                setLimit(val);
              }}
              style={{ minWidth: 60 }}
            >
              <Select.Option value={10}>10</Select.Option>
              <Select.Option value={20}>20</Select.Option>
              <Select.Option value={50}>50</Select.Option>
              <Select.Option value={100}>100</Select.Option>
              <Select.Option value={500}>500</Select.Option>
            </Select>
          </Input.Group>
          <Input.Group>
            <span className='ant-input-group-addon'>筛选字段</span>
            <Select
              mode='multiple'
              value={selectedFields}
              onChange={(val) => {
                setSelectedFields(val);
              }}
              style={{ minWidth: 410 }}
              maxTagCount='responsive'
            >
              {fields.map((item) => {
                return (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                );
              })}
            </Select>
          </Input.Group>
        </Space>
      </div>
      <RawTable data={data} selectedFields={selectedFields} />
    </Drawer>
  );
}

export default ModalHOC(index);
