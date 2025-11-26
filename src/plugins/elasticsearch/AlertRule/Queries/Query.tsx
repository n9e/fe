import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Row, Col, Form, Tooltip, AutoComplete, Input, InputNumber, Select, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import GroupBy from '@/pages/dashboard/Editor/QueryEditor/Elasticsearch/GroupBy';
import QueryName from '@/components/QueryName';
import DocumentDrawer from '@/components/DocumentDrawer';
import { CommonStateContext } from '@/App';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import IndexPatternSettingsBtn from '@/pages/explorer/Elasticsearch/components/IndexPatternSettingsBtn';
import { getESIndexPatterns } from '@/pages/log/IndexPatterns/services';

import GraphPreview from '../GraphPreview';
import Value from './Value';
import DateField from './DateField';
import AdvancedSettings from './AdvancedSettings';
import IndexPatternSelect from './IndexPatternSelect';

interface Props {
  hideIndexPattern?: boolean;
  field: any;
  datasourceValue: number;
  indexOptions: any[];
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function Query(props: Props) {
  const { t, i18n } = useTranslation('alertRules');
  const { darkMode } = useContext(CommonStateContext);
  const { field } = props;
  const { hideIndexPattern, datasourceValue, indexOptions, disabled, children } = props;
  const indexPatternsAuthorized = useIsAuthorized(['/log/index-patterns']);
  const [indexSearch, setIndexSearch] = useState('');
  const [indexPatternsRefreshFlag, setIndexPatternsRefreshFlag] = useState(_.uniqueId('indexPatternsRefreshFlag_'));
  const [indexPatterns, setIndexPatterns] = useState<any[]>([]);
  const names = ['rule_config', 'queries'];
  const queries = Form.useWatch(names);
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
    if (datasourceValue && !hideIndexPattern) {
      getESIndexPatterns(datasourceValue).then((res) => {
        setIndexPatterns(res);
      });
    }
  }, [datasourceValue, indexPatternsRefreshFlag]);

  return (
    <div key={field.key} className='bg-fc-200 p-4 mb-4' style={{ position: 'relative' }}>
      <Row gutter={8}>
        <Col flex='32px'>
          <Form.Item {...field} name={[field.name, 'ref']} initialValue='A'>
            <QueryName existingNames={_.map(queries, 'ref')} />
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
                        options={_.concat(
                          [
                            {
                              label: t('datasource:es.index'),
                              value: 'index',
                            },
                          ],
                          hideIndexPattern ? [] : [{ label: t('datasource:es.indexPatterns'), value: 'index_pattern' }],
                        )}
                        dropdownMatchSelectWidth={false}
                        showArrow={hideIndexPattern ? false : true}
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
                    <Tooltip title={t('common:page_help')}>
                      <QuestionCircleOutlined
                        onClick={() => {
                          DocumentDrawer({
                            language: i18n.language,
                            darkMode,
                            title: t('common:page_help'),
                            type: 'iframe',
                            documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/alert/alert-rules/query-data/es/',
                          });
                        }}
                      />
                    </Tooltip>
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
                  <InputNumber disabled={disabled} style={{ width: '100%' }} min={0} />
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
      <Value
        datasourceValue={datasourceValue}
        index={curIndexValue}
        field={field}
        preName={names}
        disabled={disabled}
        functions={['count', 'avg', 'sum', 'max', 'min', 'p90', 'p95', 'p99']}
      />
      <div style={{ marginTop: 8 }}>
        <GroupBy datasourceValue={datasourceValue} index={curIndexValue} parentNames={names} prefixField={field} prefixFieldNames={[field.name]} disabled={disabled} />
      </div>
      <AdvancedSettings field={field} />
      {children}
      <GraphPreview datasourceValue={datasourceValue} data={queries?.[field.name]} />
    </div>
  );
}
