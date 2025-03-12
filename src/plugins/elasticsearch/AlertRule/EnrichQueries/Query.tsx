import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Row, Col, Tooltip, AutoComplete, InputNumber, Select, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import { alphabet } from '@/utils/constant';
import IndexPatternSelect from '@/plugins/elasticsearch/AlertRule/Queries/IndexPatternSelect';
import DateField from '@/plugins/elasticsearch/AlertRule/Queries/DateField';
import Value from '@/plugins/elasticsearch/AlertRule/Queries/Value';
import IndexPatternSettingsBtn from '@/pages/explorer/Elasticsearch/components/IndexPatternSettingsBtn';
import { getESIndexPatterns } from '@/pages/log/IndexPatterns/services';

interface Props {
  field: any;
  datasourceValue: number;
  indexOptions: any[];
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function Query(props: Props) {
  const { t } = useTranslation('alertRules');
  const { field, datasourceValue, indexOptions, disabled, children } = props;
  const indexPatternsAuthorized = useIsAuthorized(['/log/index-patterns']);
  const [indexSearch, setIndexSearch] = useState('');
  const [indexPatternsRefreshFlag, setIndexPatternsRefreshFlag] = useState(_.uniqueId('indexPatternsRefreshFlag_'));
  const [indexPatterns, setIndexPatterns] = useState<any[]>([]);
  const names = ['extra_config', 'enrich_queries'];
  const indexType = Form.useWatch([...names, field.name, 'index_type']);
  const indexValue = Form.useWatch([...names, field.name, 'index']);
  const indexPatternId = Form.useWatch([...names, field.name, 'index_pattern']);
  const curIndexValue = useMemo(() => {
    if (indexType === 'index') {
      return indexValue;
    }
    return _.find(indexPatterns, { id: indexPatternId })?.name;
  }, [indexType, indexValue, indexPatternId, JSON.stringify(indexPatterns)]);

  useEffect(() => {
    if (datasourceValue) {
      getESIndexPatterns(datasourceValue).then((res) => {
        setIndexPatterns(res);
      });
    }
  }, [datasourceValue, indexPatternsRefreshFlag]);

  return (
    <div key={field.key} className='n9e-fill-color-3' style={{ padding: 10, marginBottom: 10, position: 'relative' }}>
      <Row gutter={8}>
        <Col flex='32px'>
          <Form.Item name={[field.name, 'ref']} initialValue={alphabet[field.name]}>
            <Input readOnly style={{ width: '32px' }} />
          </Form.Item>
        </Col>
        <Col flex='auto'>
          <Row gutter={8}>
            <Col span={7}>
              <InputGroupWithFormItem
                label={
                  <Space>
                    <Form.Item {...field} name={[field.name, 'index_type']} noStyle initialValue='index'>
                      <Select
                        bordered={false}
                        options={[
                          {
                            label: t('datasource:es.index'),
                            value: 'index',
                          },
                          {
                            label: t('datasource:es.indexPatterns'),
                            value: 'index_pattern',
                          },
                        ]}
                        dropdownMatchSelectWidth={false}
                      />
                    </Form.Item>
                    <Tooltip title={<Trans ns='datasource' i18nKey='datasource:es.index_tip' components={{ 1: <br /> }} />}>
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                addonAfter={
                  indexType === 'index_pattern' &&
                  indexPatternsAuthorized && (
                    <IndexPatternSettingsBtn
                      onReload={() => {
                        setIndexPatternsRefreshFlag(_.uniqueId('indexPatternsRefreshFlag_'));
                      }}
                    />
                  )
                }
              >
                {indexType === 'index' && (
                  <Form.Item
                    {...field}
                    name={[field.name, 'index']}
                    rules={[
                      {
                        required: true,
                        message: t('datasource:es.index_msg'),
                      },
                    ]}
                  >
                    <AutoComplete
                      style={{ width: '100%' }}
                      dropdownMatchSelectWidth={false}
                      options={_.filter(indexOptions, (item) => {
                        if (indexSearch) {
                          return item.value.includes(indexSearch);
                        }
                        return true;
                      })}
                      onSearch={(val) => {
                        setIndexSearch(val);
                      }}
                      disabled={disabled}
                    />
                  </Form.Item>
                )}
                {indexType === 'index_pattern' && <IndexPatternSelect field={field} indexPatterns={indexPatterns} />}
              </InputGroupWithFormItem>
            </Col>
            <Col span={indexType === 'index' ? 7 : 12}>
              <InputGroupWithFormItem
                label={
                  <span>
                    {t('datasource:es.filter')}{' '}
                    <a href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax ' target='_blank'>
                      <QuestionCircleOutlined />
                    </a>
                  </span>
                }
                labelWidth={90}
              >
                <Form.Item {...field} name={[field.name, 'filter']}>
                  <Input disabled={disabled} />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
            {indexType === 'index' && (
              <Col span={5}>
                <DateField disabled={disabled} datasourceValue={datasourceValue} index={indexValue} field={field} preName={names} />
              </Col>
            )}
            <Col span={5}>
              <Input.Group>
                <span className='ant-input-group-addon'>{t('datasource:es.interval')}</span>
                <Form.Item {...field} name={[field.name, 'interval']} noStyle>
                  <InputNumber disabled={disabled} style={{ width: '100%' }} />
                </Form.Item>
                <span className='ant-input-group-addon'>
                  <Form.Item {...field} name={[field.name, 'interval_unit']} noStyle initialValue='min'>
                    <Select disabled={disabled}>
                      <Select.Option value='second'>{t('common:time.second')}</Select.Option>
                      <Select.Option value='min'>{t('common:time.minute')}</Select.Option>
                      <Select.Option value='hour'>{t('common:time.hour')}</Select.Option>
                    </Select>
                  </Form.Item>
                </span>
              </Input.Group>
            </Col>
          </Row>
        </Col>
      </Row>
      <Value datasourceValue={datasourceValue} index={curIndexValue} field={field} preName={names} disabled={disabled} functions={['rawData']} />
      {children}
    </div>
  );
}
