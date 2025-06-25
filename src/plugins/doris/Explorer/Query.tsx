import React, { useState } from 'react';
import { Input, Form, Row, Col, Select, Tooltip, Space, Button } from 'antd';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { useTranslation } from 'react-i18next';
import TimeRangePicker, { parseRange } from '@/components/TimeRangePicker';
import { generateSQL } from '../services';
import _ from 'lodash';
import moment from 'moment';

import LogQL from '@/components/LogQL';

import { DownOutlined, RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
export default function DorisExplorerQuery({ disabled, onExecute, mode, subMode, setSubMode, form, treeSelect, loading }) {
  const { t } = useTranslation('db_doris');

  const submitBtn = (
    <Form.Item>
      <Button type='primary' onClick={onExecute} disabled={disabled} loading={loading}>
        {t('query.execute')}
      </Button>
    </Form.Item>
  );
  if (mode === 'raw' && subMode === 'condition')
    return <DorisRawQuery t={t} disabled={disabled} submitBtn={submitBtn} setSubMode={setSubMode} form={form} treeSelect={treeSelect} />;
  if (mode === 'raw' && subMode === 'sql') return <DorisSQlQuery t={t} disabled={disabled} submitBtn={submitBtn} setSubMode={setSubMode} form={form} />;
  if (mode === 'metric') return <DorisMetricQuery t={t} disabled={disabled} submitBtn={submitBtn} />;
  return null;
}

function DorisRawQuery({ t, disabled, submitBtn, setSubMode, form, treeSelect }) {
  const { t: dorisT } = useTranslation('db_doris');

  return (
    <Row gutter={8}>
      <Col flex='auto'>
        <InputGroupWithFormItem
          customStyle={{ height: 33 }}
          label={
            <Button
              type='primary'
              ghost
              onClick={() => {
                setSubMode('sql');
                if (!treeSelect.table) return;
                const values = form.getFieldsValue();
                const query = values.query;
                const range = parseRange(query.range);
                const sql = generateSQL({
                  table: treeSelect.table,
                  time_field: query.time_field,
                  from: moment(range.start).format('YYYY-MM-DD HH:mm:ss'),
                  to: moment(range.end).format('YYYY-MM-DD HH:mm:ss'),
                  condition: query.condition,
                  limit: 20,
                  offset: 0,
                });
                form.setFields([{ name: ['query', 'sql'], value: sql.replaceAll('\n', ' ') }]);
              }}
            >
              {dorisT('quick_query')}
              <Tooltip title={dorisT('quick_query_tip')}>
                <QuestionCircleOutlined />
              </Tooltip>
            </Button>
          }
          noStyle
        >
          <Form.Item name={['query', 'condition']}>
            <Input disabled={disabled} />
          </Form.Item>
        </InputGroupWithFormItem>
      </Col>
      <Col flex='400px'>
        <Space
          style={{
            display: 'flex',
          }}
        >
          <InputGroupWithFormItem label={t('query.time_field')}>
            <Form.Item
              name={['query', 'time_field']}
              rules={[
                {
                  required: true,
                  message: t('query.time_field_msg'),
                },
              ]}
            >
              <Input disabled={disabled} style={{ minWidth: 80 }} />
            </Form.Item>
          </InputGroupWithFormItem>
          <Form.Item
            name={['query', 'range']}
            initialValue={{
              start: 'now-1h',
              end: 'now',
            }}
          >
            <TimeRangePicker disabled={disabled} dateFormat='YYYY-MM-DD HH:mm:ss' allowClear />
          </Form.Item>
          {submitBtn}
        </Space>
      </Col>
    </Row>
  );
}

function DorisSQlQuery({ t, disabled, submitBtn, setSubMode, form }) {
  const [updated, setUpdated] = useState(false);
  const { t: dorisT } = useTranslation('db_doris');
  return (
    <Row gutter={8} wrap={false}>
      <Col flex='auto'>
        <InputGroupWithFormItem
          customStyle={{ height: 33 }}
          label={
            <Button
              type='primary'
              ghost
              onClick={() => {
                updated &&
                  form.setFields([
                    { name: ['query', 'condition'], value: '' },
                    { name: ['query', 'time_field'], value: '' },
                  ]);
                setSubMode('condition');
              }}
            >
              {dorisT('custom_query')}
              <Tooltip title={t('custom_query_tip')}>
                <QuestionCircleOutlined />
              </Tooltip>
            </Button>
          }
          noStyle
        >
          <Form.Item
            name={['query', 'sql']}
            rules={[
              {
                required: true,
                message: t('query.sql_msg'),
              },
            ]}
          >
            <LogQL onChange={() => setUpdated(true)} validateTrigger={[]} datasourceCate='doris' datasourceValue={0} query={{}} historicalRecords={[]} />
          </Form.Item>
        </InputGroupWithFormItem>
      </Col>
      <Col flex='none'>{submitBtn}</Col>
    </Row>
  );
}

function DorisMetricQuery({ t, disabled, submitBtn }) {
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(true);
  return (
    <>
      <Row gutter={8} wrap={false}>
        <Col flex='auto'>
          <InputGroupWithFormItem label={t('custom_query')}>
            <Form.Item
              name={['query', 'sql']}
              rules={[
                {
                  required: true,
                  message: t('query.sql_msg'),
                },
              ]}
            >
              <LogQL validateTrigger={[]} datasourceCate='doris' datasourceValue={0} query={{}} historicalRecords={[]} />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='none'>{submitBtn}</Col>
      </Row>
      <div
        style={{
          marginBottom: advancedSettingsOpen ? 0 : 16,
        }}
      >
        <div
          style={{
            marginBottom: 8,
          }}
        >
          <span
            onClick={() => {
              setAdvancedSettingsOpen(!advancedSettingsOpen);
            }}
            style={{
              cursor: 'pointer',
            }}
          >
            {advancedSettingsOpen ? <DownOutlined /> : <RightOutlined />} {t('query.advancedSettings.title')}
          </span>
        </div>
        <div
          style={{
            display: advancedSettingsOpen ? 'block' : 'none',
          }}
        >
          <Row gutter={8}>
            <Col span={6}>
              <InputGroupWithFormItem
                label={
                  <span>
                    ValueKey{' '}
                    <Tooltip title={t('query.advancedSettings.valueKey_tip')}>
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                }
              >
                <Form.Item
                  name={['query', 'keys', 'valueKey']}
                  style={{
                    width: '100%',
                  }}
                  rules={[
                    {
                      required: true,
                      message: t('query.advancedSettings.valueKey_required'),
                    },
                  ]}
                >
                  <Input disabled={disabled} />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
            <Col span={6}>
              <InputGroupWithFormItem
                label={
                  <span>
                    LabelKey{' '}
                    <Tooltip title={t('query.advancedSettings.labelKey_tip')}>
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                }
              >
                <Form.Item
                  name={['query', 'keys', 'labelKey']}
                  style={{
                    width: '100%',
                  }}
                >
                  <Input disabled={disabled} />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
            <Col span={6}>
              <InputGroupWithFormItem
                label={
                  <Space>
                    <span>{t('query.time_field')}</span>
                  </Space>
                }
              >
                <Form.Item
                  name={['query', 'keys', 'timeKey']}
                  rules={[
                    {
                      required: true,
                      message: t('query.time_field_msg'),
                    },
                  ]}
                >
                  <Input disabled={disabled} />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
            <Col span={6}>
              <Form.Item name={['query', 'time_field']} hidden>
                <Input disabled={disabled} />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}
