import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Input, Select, Space, Tooltip, Alert, InputNumber } from 'antd';
import { CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';

import { IS_PLUS } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import QueryName, { generateQueryName } from '@/components/QueryName';
import { normalizeTime } from '@/pages/alertRules/Form/utils';

import { NAME_SPACE } from '../constants';
import AdvancedSettings from '../components/AdvancedSettings';
import GraphPreview from './GraphPreview';

interface Props {
  datasourceId: number;
  field: any;
  dbList: string[];
  disabled?: boolean;
  remove: (name: number) => void;
}

export default function Query(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceId, field, dbList, disabled, remove } = props;
  const [sqlWarningI18nKey, setSqlWarningI18nKey] = useState<string>('');
  const queries = Form.useWatch(['rule_config', 'queries']);
  const sql = Form.useWatch(['rule_config', 'queries', field.name, 'sql']);

  useEffect(() => {
    if (!sql) {
      setSqlWarningI18nKey('');
      return;
    }
    // 如果查询条件中没包含关键字（不区分大小写，TIMESTAMP、DATE、INTERVAL、DATE_TRUNC、NOW()、$__timeFilter）
    const warningKeywords = ['TIMESTAMP', 'DATE', 'INTERVAL', 'DATE_TRUNC', 'NOW()', '$__timeFilter'];
    const hasKeyword = warningKeywords.some((keyword) => {
      return _.includes(_.upperCase(sql), _.upperCase(keyword));
    });
    if (!hasKeyword) {
      setSqlWarningI18nKey('query.sql_warning_1');
    } else if (_.includes(sql, '$__timeGroup')) {
      setSqlWarningI18nKey('query.sql_warning_2');
    } else {
      setSqlWarningI18nKey('');
    }
  }, [sql]);

  return (
    <div key={field.key} className='alert-rule-trigger-container'>
      {sqlWarningI18nKey && (
        <Alert
          className='mb-2'
          type='warning'
          message={
            <Trans
              ns={NAME_SPACE}
              i18nKey={sqlWarningI18nKey}
              components={{
                b: <strong />,
              }}
            />
          }
        />
      )}
      <Row gutter={8} wrap={false}>
        <Col flex='none'>
          <Form.Item {...field} name={[field.name, 'ref']} initialValue={generateQueryName(_.map(queries, 'ref'))}>
            <QueryName existingNames={_.map(queries, 'ref')} />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <InputGroupWithFormItem label={t('query.database')}>
            <Form.Item {...field} name={[field.name, 'database']}>
              <Select style={{ width: 200 }} disabled={disabled}>
                {dbList.map((db) => (
                  <Select.Option key={db} value={db}>
                    {db}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='auto'>
          <InputGroupWithFormItem
            label={
              <Space>
                SQL
                <Tooltip
                  overlayClassName='ant-tooltip-with-link ant-tooltip-auto-width'
                  title={
                    <Trans
                      ns='db_doris'
                      i18nKey='query.query_tip'
                      components={{
                        br: <br />,
                        a: <a href='/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/' target='_blank' />,
                      }}
                    />
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Form.Item
              {...field}
              name={[field.name, 'sql']}
              validateTrigger={['onBlur']}
              trigger='onChange'
              rules={[{ required: true, message: t('datasource:query.query_required') }]}
            >
              <Input placeholder={t('query.query_placeholder')} disabled={disabled}></Input>
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='none'>
          <Input.Group>
            <span className='ant-input-group-addon'>
              {
                <Space>
                  {t('query.interval')}
                  <Tooltip
                    title={
                      <Trans
                        ns={NAME_SPACE}
                        i18nKey='query.interval_tip'
                        components={{
                          br: <br />,
                        }}
                      />
                    }
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
            </span>
            <Form.Item {...field} name={[field.name, 'interval']} noStyle>
              <InputNumber disabled={disabled} style={{ width: 80 }} min={0} />
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
      <AdvancedSettings prefixField={field} prefixName={[field.name]} disabled={disabled} showUnit={IS_PLUS} showOffset span={6} expanded />
      <CloseCircleOutlined className='alert-rule-trigger-remove' onClick={() => remove(field.name)} />
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const cate = getFieldValue('cate');
          const sql = getFieldValue(['rule_config', 'queries', field.name, 'sql']);
          const database = getFieldValue(['rule_config', 'queries', field.name, 'database']);
          const interval = getFieldValue(['rule_config', 'queries', field.name, 'interval']);
          const interval_unit = getFieldValue(['rule_config', 'queries', field.name, 'interval_unit']);
          const intervalValue = normalizeTime(interval, interval_unit);
          const offset = getFieldValue(['rule_config', 'queries', field.name, 'offset']);

          return <GraphPreview cate={cate} datasourceValue={datasourceId} sql={sql} database={database} interval={intervalValue} offset={offset} />;
        }}
      </Form.Item>
    </div>
  );
}
