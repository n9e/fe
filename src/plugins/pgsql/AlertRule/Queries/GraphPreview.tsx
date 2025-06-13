import React, { useRef, useState, useEffect } from 'react';
import { Button, Popover, Alert, Spin, Empty, Table } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import getTextWidth from '@/pages/dashboard/Renderer/utils/getTextWidth';

import { getLogsQuery } from '../../services';
import { NAME_SPACE, QUERY_KEY } from '../../constants';

export default function GraphPreview({ cate, datasourceValue, query }) {
  const { t } = useTranslation(NAME_SPACE);
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [errorContent, setErrorContent] = useState('');
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
  });
  const fetchData = () => {
    if (datasourceValue) {
      const parsedRange = parseRange(range);
      const from = moment(parsedRange.start).unix();
      const to = moment(parsedRange.end).unix();
      setLoading(true);
      getLogsQuery({
        queries: [
          {
            ds_cate: NAME_SPACE,
            ds_id: datasourceValue,
            ref: query.ref,
            query: {
              ref: query.ref,
              [QUERY_KEY]: query[QUERY_KEY],
              from,
              to,
            },
          },
        ],
      })
        .then((res) => {
          const data = _.flatten(
            _.map(res, (item) => {
              return _.map(item?.data, (subItem) => {
                return subItem;
              });
            }),
          );
          setErrorContent('');
          setData(data);
          setColumns(
            _.union(
              _.flattenDeep(
                _.map(data, (item) => {
                  return _.keys(item);
                }),
              ),
            ),
          );
        })
        .catch((err) => {
          const msg = _.get(err, 'message');
          setErrorContent(`Error executing query: ${msg}`);
          setData([]);
          setColumns([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [JSON.stringify(range)]);

  return (
    <div ref={divRef}>
      <Popover
        placement='right'
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
        }}
        title={t('datasource:es.alert.query.preview')}
        content={
          <div style={{ width: 700 }}>
            {errorContent && <Alert style={{ marginBottom: 16 }} message={errorContent} type='error' />}
            {_.isEmpty(data) ? (
              <Spin spinning={loading}>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </Spin>
            ) : (
              <Table
                loading={loading}
                size='small'
                rowKey='_ts'
                dataSource={data}
                columns={_.map(columns, (item) => {
                  return {
                    title: item,
                    dataIndex: item,
                    key: item,
                    render: (text) => {
                      return (
                        <div
                          style={{
                            minWidth: getTextWidth(item),
                          }}
                        >
                          {text}
                        </div>
                      );
                    },
                  };
                })}
                pagination={false}
                scroll={{
                  x: 'max-content',
                  y: 'calc(100% - 36px)',
                }}
              />
            )}
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
