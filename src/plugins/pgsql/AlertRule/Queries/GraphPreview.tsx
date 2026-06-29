import React, { useRef, useState, useEffect, useContext } from 'react';
import { Button, Popover, Alert, Spin, Empty, Table, Select, Space } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import getTextWidth from '@/pages/dashboard/Renderer/utils/getTextWidth';

import { getLogsQuery } from '../../services';
import { NAME_SPACE, QUERY_KEY } from '../../constants';

export default function GraphPreview({ cate, datasourceValue, query }) {
  const { t } = useTranslation(NAME_SPACE);
  const { groupedDatasourceList } = useContext(CommonStateContext);
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
  const [datasourceId, setDatasourceId] = useState<number>(datasourceValue);
  const fetchData = () => {
    if (datasourceId) {
      const parsedRange = parseRange(range);
      const from = moment(parsedRange.start).unix();
      const to = moment(parsedRange.end).unix();
      setLoading(true);
      getLogsQuery({
        queries: [
          {
            ds_cate: NAME_SPACE,
            ds_id: datasourceId,
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
  }, [JSON.stringify(range), datasourceId]);

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
              {t('datasource:es.alert.query.preview')}
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
