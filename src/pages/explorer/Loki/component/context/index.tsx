import React, { useEffect, useState } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Drawer, Table, Space, Input, Select, Spin, Modal, message } from 'antd';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import './index.less';
import HighlightText from '../logRow/highlight';
import { LogSortItem, Row, getRowSytleColor, parseResponse } from '../../util';
import { getLogsQuery } from '../../services';
import { SelectSort } from '../operator/SelectSort';
interface IProps {
  time: string;
  log: string;
  tags: object;
  datasourceValue: number;
}

function LogContext(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('explorer');
  const { time, log, tags, datasourceValue, visible, destroy } = props;
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Row[]>([]);
  const [sortOrder, setSortOrder] = useState<keyof typeof LogSortItem>('NEWEST_FIRST');

  const getIndexLogColor = (logRow: string) => {
    if (log == logRow) {
      return '#EAE8F2';
    }
  };
  const fetchData = async () => {
    const expr = _.map(tags, (value, key) => `${key}="${value}"`).join(',');
    try {
      setLoading(true);
      const twoHoursAgoQueryParams = {
        query: `{${expr}}`,
        limit: limit,
        start:
          moment(Number(time) / 1000 / 1000)
            .subtract(2, 'hours')
            .valueOf() *
          1000 *
          1000,
        end: Number(time),
        direction: 'BACKWARD',
      };
      const twoHoursLaterQueryParams = {
        query: `{${expr}}`,
        limit: limit,
        start: Number(time),
        end:
          moment(Number(time) / 1000 / 1000)
            .add(2, 'hours')
            .valueOf() *
          1000 *
          1000,
        direction: 'FORWARD',
      };
      const res1 = await getLogsQuery(datasourceValue, twoHoursAgoQueryParams);
      const res2 = await getLogsQuery(datasourceValue, twoHoursLaterQueryParams);
      setData(_.concat(parseResponse(res2.result || []).dataRows, parseResponse(res1.result || []).dataRows));
    } catch (err) {
      message.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [time, log, tags, datasourceValue, limit]);

  useEffect(() => {
    if (sortOrder === 'OLDEST_FIRST') {
      setData(_.sortBy(data.flat(), (row) => row.time));
    } else {
      setData(_.sortBy(data.flat(), (row) => -row.time));
    }
  }, [sortOrder]);
  return (
    <Modal title={t('log.context')} centered width={960} onCancel={destroy} visible={visible} footer={null}>
      <div style={{ marginBottom: 10 }}>
        <Space>
          <Input.Group>
            <span className='ant-input-group-addon'>结果数</span>
            <Select
              value={limit}
              onChange={(val) => {
                setLimit(val);
              }}
              style={{ minWidth: 60 }}
            >
              <Select.Option value={10}>上下10条日志</Select.Option>
              <Select.Option value={20}>上下20条日志</Select.Option>
              <Select.Option value={50}>上下50条日志</Select.Option>
            </Select>
          </Input.Group>
          <SelectSort onChange={(v) => setSortOrder(v)} />
        </Space>
      </div>
      <Spin spinning={loading}>
        <div className='context-main'>
          {data ? (
            data.map((row) => {
              return (
                <>
                  {/* @ts-ignore */}
                  <span className='logRowStyled' style={{ borderLeftColor: getRowSytleColor(row.tags.level) }}>
                    <span style={{ background: getIndexLogColor(row.log), display: 'flex' }}>
                      <span className='rowLogContent'>
                        <HighlightText text={row.log} keyword={[]} prettifyJson={false} />
                      </span>
                    </span>
                  </span>
                </>
              );
            })
          ) : (
            <div></div>
          )}
        </div>
      </Spin>
    </Modal>
  );
}

export default ModalHOC(LogContext);
