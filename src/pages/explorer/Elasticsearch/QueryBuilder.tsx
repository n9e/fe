import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { useLocation } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Space, Input, Tooltip, Form, AutoComplete, Select, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TimeRangePicker from '@/components/TimeRangePicker';
import { getIndices, getFullFields, Field } from './services';

interface Props {
  onExecute: () => void;
  datasourceValue?: number;
  setFields: (fields: Field[]) => void;
  allowHideSystemIndices?: boolean;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation('explorer');
  const { onExecute, datasourceValue, setFields, allowHideSystemIndices = false } = props;
  const params = new URLSearchParams(useLocation().search);
  const [indexOptions, setIndexOptions] = useState<any[]>([]);
  const [indexSearch, setIndexSearch] = useState('');
  const [dateFields, setDateFields] = useState<Field[]>([]);
  const { run: onIndexChange } = useDebounceFn(
    (val) => {
      if (datasourceValue && val) {
        getFullFields(datasourceValue, val, {
          type: 'date',
          allowHideSystemIndices,
        }).then((res) => {
          setFields(res.allFields);
          setDateFields(res.fields);
        });
      }
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    if (datasourceValue) {
      getIndices(datasourceValue, allowHideSystemIndices).then((res) => {
        const indexOptions = _.map(res, (item) => {
          return {
            value: item,
          };
        });
        setIndexOptions(indexOptions);
      });
    }
  }, [datasourceValue, allowHideSystemIndices]);

  useEffect(() => {
    // 假设携带数据源值时会同时携带其他的参数，并且触发一次查询
    onIndexChange(params.get('index_name'));
  }, []);

  return (
    <Space>
      <Input.Group compact>
        <span
          className='ant-input-group-addon'
          style={{
            width: 70,
            height: 32,
            lineHeight: '32px',
          }}
        >
          {t('datasource:es.index')}{' '}
          <Tooltip title={<Trans ns='datasource' i18nKey='datasource:es.index_tip' components={{ 1: <br /> }} />}>
            <QuestionCircleOutlined />
          </Tooltip>
        </span>
        <Form.Item
          name={['query', 'index']}
          rules={[
            {
              required: true,
              message: t('datasource:es.index_msg'),
            },
          ]}
          validateTrigger='onBlur'
          style={{ width: 190 }}
        >
          <AutoComplete
            dropdownMatchSelectWidth={false}
            style={{ minWidth: 100 }}
            options={_.filter(indexOptions, (item) => {
              if (indexSearch) {
                return _.includes(item.value, indexSearch);
              }
              return true;
            })}
            onSearch={(val) => {
              setIndexSearch(val);
            }}
            onChange={(val) => {
              onIndexChange(val);
            }}
          />
        </Form.Item>
      </Input.Group>
      <Input.Group compact>
        <span
          className='ant-input-group-addon'
          style={{
            width: 90,
            height: 32,
            lineHeight: '32px',
          }}
        >
          {t('datasource:es.filter')}{' '}
          <a href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax ' target='_blank'>
            <QuestionCircleOutlined />
          </a>
        </span>
        <Form.Item name={['query', 'filter']} style={{ minWidth: 300 }}>
          <Input />
        </Form.Item>
      </Input.Group>
      <div style={{ display: 'flex' }}>
        <Space>
          <Input.Group compact>
            <span
              className='ant-input-group-addon'
              style={{
                width: 90,
                height: 32,
                lineHeight: '32px',
              }}
            >
              {t('datasource:es.date_field')}{' '}
            </span>
            <Form.Item
              name={['query', 'date_field']}
              initialValue='@timestamp'
              style={{ width: 'calc(100% - 90px)' }}
              rules={[
                {
                  required: true,
                  message: t('datasource:es.date_field_msg'),
                },
              ]}
            >
              <Select dropdownMatchSelectWidth={false} style={{ width: 150 }} showSearch>
                {_.map(dateFields, (item) => {
                  return (
                    <Select.Option key={item.name} value={item.name}>
                      {item.name}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Input.Group>
          <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
            <TimeRangePicker />
          </Form.Item>
          <Form.Item>
            <Button
              type='primary'
              onClick={() => {
                onExecute();
              }}
            >
              {t('query_btn')}
            </Button>
          </Form.Item>
        </Space>
      </div>
    </Space>
  );
}
