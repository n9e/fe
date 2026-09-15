import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Row, Col, Form, Tooltip, AutoComplete, InputNumber, Select, Space, Segmented, Button, Modal } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import QueryName from '@/components/QueryName';
import DocumentDrawer from '@/components/DocumentDrawer';
import { CommonStateContext } from '@/App';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import IndexPatternSettingsBtn from '@/pages/explorer/Elasticsearch/components/IndexPatternSettingsBtn';
import { getESIndexPatterns } from '@/pages/log/IndexPatterns/services';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';
import UnitPicker from '@/pages/dashboard/Components/UnitPicker';

import LuceneInput from '@/plugins/elasticsearch/components/LuceneInput';
import { SqlMonacoEditor, SqlMonacoPreview } from '@fc-components/monaco-editor';
import SQLBuilderModal from '@/plugins/elasticsearch/components/SQLBuilderModal';
import { normalizeTime } from '@/plugins/elasticsearch/utils';

import GraphPreview from '../GraphPreview';
import Value from './Value';
import DateField from './DateField';
import AdvancedSettings from './AdvancedSettings';
import IndexPatternSelect from './IndexPatternSelect';
import GroupBy from './GroupBy';

interface Props {
  hideIndexPattern?: boolean;
  field: any;
  datasourceValue: number;
  indexOptions: any[];
  disabled?: boolean;
  supportsSQL?: boolean;
  onClose?: () => void;
}

export default function Query(props: Props) {
  const { t, i18n } = useTranslation('alertRules');
  const { t: tES } = useTranslation('elasticsearch');
  const { darkMode } = useContext(CommonStateContext);
  const { field } = props;
  const { hideIndexPattern, datasourceValue, indexOptions, disabled, onClose, supportsSQL } = props;
  const indexPatternsAuthorized = useIsAuthorized(['/log/index-patterns']);
  const [indexSearch, setIndexSearch] = useState('');
  const [indexPatternsRefreshFlag, setIndexPatternsRefreshFlag] = useState(_.uniqueId('indexPatternsRefreshFlag_'));
  const [indexPatterns, setIndexPatterns] = useState<any[]>([]);
  const names = ['rule_config', 'queries'];
  const queries = Form.useWatch(names);
  const savedSyntax = Form.useWatch([...names, field.name, 'syntax']);
  const syntax = supportsSQL && savedSyntax === 'sql' ? 'sql' : 'dsl';
  const indexType = Form.useWatch([...names, field.name, 'index_type']);
  const indexValue = Form.useWatch([...names, field.name, 'index']);
  const indexPatternId = Form.useWatch([...names, field.name, 'index_pattern']);
  const query = queries?.[field.name];
  const editMode = query?.editMode ?? 'code';
  const [builderModalVisible, setBuilderModalVisible] = useState(false);
  const form = Form.useFormInstance();
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
      <CardContainer key={field.key} onClose={onClose}>
        <CardContainerHeader>
          <Row gutter={8}>
            <Col flex='32px'>
              <Form.Item {...field} name={[field.name, 'ref']} initialValue='A'>
                <QueryName existingNames={_.map(queries, 'ref')} />
              </Form.Item>
            </Col>
            {supportsSQL && (
              <Col flex='none'>
                <Form.Item {...field} name={[field.name, 'syntax']} initialValue='dsl' noStyle>
                  <Segmented
                    disabled={disabled}
                    options={[
                      { label: 'Lucene', value: 'dsl' },
                      { label: 'SQL', value: 'sql' },
                    ]}
                  />
                </Form.Item>
              </Col>
            )}
            {syntax === 'sql' && (
              <Col flex='none'>
                <Segmented
                  disabled={disabled}
                  value={editMode}
                  options={[{ label: tES('builder.title'), value: 'builder' }, { label: tES('builder.code'), value: 'code' }]}
                  onChange={(value) => {
                    // 从 Code 切到 Builder 且已有 SQL 时需确认丢弃：
                    // 清空 sql 和 builderConfig，强制用 Builder 重新生成，
                    // 避免残留配置生成的 SQL 与当前手写 SQL 不一致。
                    if (value === 'builder' && editMode === 'code' && query?.sql) {
                      Modal.confirm({
                        title: tES('builder.switch_to_builder_confirm_title'),
                        content: tES('builder.switch_to_builder_confirm_content'),
                        onOk: () => form.setFields([
                          { name: [...names, field.name, 'editMode'], value: 'builder' },
                          { name: [...names, field.name, 'sql'], value: undefined },
                          { name: [...names, field.name, 'builderConfig'], value: undefined },
                        ]),
                      });
                      return;
                    }
                    form.setFields([{ name: [...names, field.name, 'editMode'], value }]);
                  }}
                />
              </Col>
            )}
            {syntax === 'sql' && (
              <Col flex='220px'>
                <InputGroupWithFormItem label={tES('query.range')} addonAfter={<Form.Item {...field} name={[field.name, 'interval_unit']} noStyle initialValue='min'><Select disabled={disabled} dropdownMatchSelectWidth={false}><Select.Option value='second'>{t('common:time.second')}</Select.Option><Select.Option value='min'>{t('common:time.minute')}</Select.Option><Select.Option value='hour'>{t('common:time.hour')}</Select.Option></Select></Form.Item>}>
                  <Form.Item {...field} name={[field.name, 'interval']} noStyle initialValue={5}><InputNumber disabled={disabled} min={1} style={{ width: '100%' }} /></Form.Item>
                </InputGroupWithFormItem>
              </Col>
            )}
          {syntax !== 'sql' && <Col flex='auto'>
            <Row gutter={8}>
              <Col flex='320px'>
                <InputGroupWithFormItem
                  label={
                    <Space>
                      <Form.Item {...field} name={[field.name, 'index_type']} noStyle initialValue='index'>
                        <Select
                          data-testid={`es-query-${field.name}-index-type-select`}
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
                    <Tooltip title={indexValue} placement='right'>
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
                          placeholder={t('datasource:es.index_placeholder')}
                        />
                      </Form.Item>
                    </Tooltip>
                  )}
                  {indexType === 'index_pattern' && <IndexPatternSelect field={field} indexPatterns={indexPatterns} />}
                </InputGroupWithFormItem>
              </Col>
              <Col flex='auto'>
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
                              documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/query-data/es/',
                            });
                          }}
                        />
                      </Tooltip>
                    </span>
                  }
                  addonAfter='Lucene'
                >
                  <Form.Item {...field} name={[field.name, 'filter']}>
                    <LuceneInput disabled={disabled} placeholder={t('datasource:es.filter_placeholder')} />
                  </Form.Item>
                </InputGroupWithFormItem>
              </Col>
            </Row>
          </Col>}
        </Row>
      </CardContainerHeader>
      {syntax === 'sql' ? (
        <>
          <Form.Item {...field} name={[field.name, 'editMode']} initialValue='code' hidden><input type='hidden' /></Form.Item>
          {editMode === 'builder' && query?.sql && <CardContainer className='mb-4 bg-fc-150'><SqlMonacoPreview theme={darkMode ? 'dark' : 'light'} value={query.sql} /></CardContainer>}
          {editMode === 'builder' && <Button className='mb-3' disabled={disabled || !datasourceValue} onClick={() => setBuilderModalVisible(true)}>{tES('builder.open_builder')}</Button>}
          {editMode === 'code' && (
            <Form.Item {...field} name={[field.name, 'sql']} label='SQL' rules={[{ required: true, message: tES('query.sql_required') }]}>
              <SqlMonacoEditor disabled={disabled} maxHeight={200} enableAutocomplete enableFormat />
            </Form.Item>
          )}
          {editMode === 'builder' && (
            <SQLBuilderModal
              visible={builderModalVisible}
              datasourceValue={datasourceValue}
              interval={normalizeTime(query?.interval, query?.interval_unit) ?? 60}
              builderConfig={query?.builderConfig}
              onCancel={() => setBuilderModalVisible(false)}
              onConfirm={(builderConfig, result) => {
                form.setFields([
                  { name: [...names, field.name, 'sql'], value: result.sql, errors: [] },
                  { name: [...names, field.name, 'builderConfig'], value: builderConfig, errors: [] },
                  { name: [...names, field.name, 'keys', 'valueKey'], value: result.value_key },
                  { name: [...names, field.name, 'keys', 'labelKey'], value: result.label_key },
                ]);
                setBuilderModalVisible(false);
              }}
            />
          )}
          <Row gutter={8}>
            <Col span={6}>
              <Form.Item
                {...field}
                name={[field.name, 'keys', 'valueKey']}
                label={<Space>{tES('query.advancedSettings.valueKey')}<Tooltip title={tES('query.advancedSettings.valueKey_tip')}><QuestionCircleOutlined /></Tooltip></Space>}
                rules={[{ required: true, message: tES('query.advancedSettings.valueKey_required') }]}
              >
                <Select mode='tags' disabled={disabled} tokenSeparators={[' ']} placeholder={tES('query.advancedSettings.tags_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                {...field}
                name={[field.name, 'keys', 'labelKey']}
                label={<Space>{tES('query.advancedSettings.labelKey')}<Tooltip title={tES('query.advancedSettings.labelKey_tip')}><QuestionCircleOutlined /></Tooltip></Space>}
              >
                <Select mode='tags' disabled={disabled} tokenSeparators={[' ']} placeholder={tES('query.advancedSettings.tags_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item {...field} name={[field.name, 'unit']} label={t('common:unit')} initialValue='none'>
                <UnitPicker disabled={disabled} optionLabelProp='cleanLabel' style={{ width: '100%' }} dropdownMatchSelectWidth={false} />
              </Form.Item>
            </Col>
          </Row>
          <GraphPreview datasourceValue={datasourceValue} data={queries?.[field.name]} disabled={disabled} />
        </>
      ) : <Row gutter={8}>
        {indexType === 'index' && (
          <Col span={6}>
            <DateField disabled={disabled} datasourceValue={datasourceValue} index={indexValue} field={field} preName={names} />
          </Col>
        )}
        <Col span={6}>
          <InputGroupWithFormItem
            label={t('datasource:es.interval')}
            addonAfter={
              <Form.Item {...field} name={[field.name, 'interval_unit']} noStyle initialValue='min'>
                <Select disabled={disabled} dropdownMatchSelectWidth={false}>
                  <Select.Option value='second'>{t('common:time.second')}</Select.Option>
                  <Select.Option value='min'>{t('common:time.minute')}</Select.Option>
                  <Select.Option value='hour'>{t('common:time.hour')}</Select.Option>
                </Select>
              </Form.Item>
            }
            className='mb-4'
          >
            <Form.Item {...field} name={[field.name, 'interval']} noStyle initialValue={1}>
              <InputNumber disabled={disabled} style={{ width: '100%' }} min={1} />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col span={indexType === 'index' ? 12 : 18}>
          <Value
            datasourceValue={datasourceValue}
            index={curIndexValue}
            field={field}
            preName={names}
            disabled={disabled}
            functions={['count', 'avg', 'sum', 'max', 'min', 'p90', 'p95', 'p99']}
          />
        </Col>
      </Row>}
      {syntax !== 'sql' && <div>
        <GroupBy datasourceValue={datasourceValue} index={curIndexValue} parentNames={names} prefixField={field} prefixFieldNames={[field.name]} disabled={disabled} />
      </div>}
      {syntax !== 'sql' && <AdvancedSettings field={field} />}
      {syntax !== 'sql' && <GraphPreview datasourceValue={datasourceValue} data={queries?.[field.name]} />}
    </CardContainer>
  );
}
