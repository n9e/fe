import React, { useRef, useState, useEffect } from 'react';
import { Button, Popover, Alert, Spin, Empty, Table } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import getTextWidth from '@/pages/dashboard/Renderer/utils/getTextWidth';

import { logQuery } from '../../services';

export default function GraphPreview({ datasourceValue, query }) {
  const { t } = useTranslation();
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [errorContent, setErrorContent] = useState('');
  const [range] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
  });
  const fetchData = () => {
    if (datasourceValue) {
      const parsedRange = parseRange(range);
      const from = moment(parsedRange.start).unix();
      const to = moment(parsedRange.end).unix();
      setLoading(true);
      logQuery({
        cate: DatasourceCateEnum.victorialogs,
        datasource_id: datasourceValue,
        query: [{ query: query?.query, start: from, end: to }],
      })
        .then((res) => {
          const data = res?.list;
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
        title={
          <div className='flex justify-between'>
            <div className='leading-[32px]'>{t('datasource:es.alert.query.preview')}</div>
          </div>
        }
        content={
          <div className='w-[800px]'>
            {errorContent && <Alert className='mb-4' message={errorContent} type='error' />}
            {_.isEmpty(data) ? (
              <Spin spinning={loading}>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </Spin>
            ) : (
              <Table
                loading={loading}
                size='small'
                rowKey='_ts'
                tableLayout='auto'
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
          {t('common:datasource.queries.preview')}
        </Button>
      </Popover>
    </div>
  );
}
