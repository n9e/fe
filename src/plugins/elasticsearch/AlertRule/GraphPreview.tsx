import React, { useState, useRef, useEffect, useContext } from 'react';
import { Button, Popover, Form, Select, Space, Table } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';

import { normalizeTime } from '../utils';
import { getDsQuery } from './services';

interface IProps {
  datasourceValue: number;
  disabled?: boolean;
}

const getSerieName = (metric: Object) => {
  let name = metric['__name__'] || '';
  _.forEach(_.omit(metric, '__name__'), (value, key) => {
    name += ` ${key}: ${value}`;
  });
  return _.trim(name);
};

export default function GraphPreview(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { disabled } = props;
  const divRef = useRef<HTMLDivElement>(null);
  const form = Form.useFormInstance();
  const datasource_values = form.getFieldValue('datasource_values');
  const [visible, setVisible] = useState(false);
  const [series, setSeries] = useState<any[]>([]);
  const [columnKeys, setColumnKeys] = useState<string[]>([]);
  const [datasourceValue, setDatasourceValue] = useState<number>(props.datasourceValue);

  const fetchSeries = () => {
    const queries = form.getFieldValue(['rule_config', 'queries']);
    const now = moment().unix();

    getDsQuery(
      {
        cate: form.getFieldValue('cate'),
        datasource_id: datasourceValue,
        query: _.map(queries, (item) => {
          const interval = normalizeTime(item.interval, item.interval_unit) ?? 300; // 默认5分钟
          return {
            ref: item.ref,
            index_type: item.index_type || 'index',
            index: item.index,
            index_pattern: item.index_pattern,
            filter: item.filter,
            value: item.value,
            group_by: item.group_by,
            date_field: item.date_field,
            interval,
            start: now - interval,
            end: now,
          };
        }),
      },
      false,
    )
      .then((res) => {
        setSeries(
          _.map(res.dat, (item) => {
            return {
              id: _.uniqueId('series_'),
              name: getSerieName(item.metric),
              metric: item.metric,
              data: item.values,
            };
          }),
        );
        const keys: string[] = [];
        _.forEach(res.dat, (item) => {
          _.forEach(item.metric, (value, key) => {
            if (!_.includes(keys, key) && key !== '__name__') {
              keys.push(key);
            }
          });
        });
        setColumnKeys(keys);
      })
      .catch(() => {
        setSeries([]);
      });
  };

  useEffect(() => {
    setDatasourceValue(props.datasourceValue);
  }, [props.datasourceValue]);

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
            <Space>
              <span>{t('common:datasource.name')}:</span>
              <Select
                value={datasourceValue}
                onChange={(value) => {
                  setDatasourceValue(value);
                }}
                style={{ width: 200 }}
                options={_.map(
                  _.filter(groupedDatasourceList.elasticsearch, (item) => {
                    return _.includes(datasource_values, item.id);
                  }),
                  (item) => {
                    return {
                      label: item.name,
                      value: item.id,
                    };
                  },
                )}
              />
            </Space>
          </div>
        }
        content={
          <div style={{ width: 700 }}>
            <Table
              size='small'
              pagination={false}
              dataSource={series}
              columns={_.concat(
                {
                  title: 'Name',
                  render: (record) => {
                    return record.metric?.['__name__'] ?? '-';
                  },
                },
                _.map(columnKeys, (item) => {
                  return {
                    title: item,
                    render: (record) => {
                      return record.metric?.[item] ?? '-';
                    },
                  };
                }) as any[],
                {
                  title: 'Value',
                  render: (record) => {
                    return _.last(record.data)?.[1] ?? '-';
                  },
                },
              )}
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
