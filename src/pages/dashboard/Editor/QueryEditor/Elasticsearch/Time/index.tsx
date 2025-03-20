import React from 'react';
import { Row, Col, Form, Input, InputNumber, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import _ from 'lodash';
import TimeRangePicker, { isMathString } from '@/components/TimeRangePicker';
import DateField from '../DateField';

export default function index({ prefixField = {}, prefixNameField = [], datasourceValue }: { prefixField: any; prefixNameField: any[]; datasourceValue: number }) {
  const { t } = useTranslation('datasource');
  const chartForm = Form.useFormInstance();
  const indexType = Form.useWatch(['targets', prefixField.name, 'query', 'index_type']);

  return (
    <>
      <Row gutter={10}>
        <Col span={16}>
          <div style={{ marginBottom: 8 }}>{t('datasource:es.time_label')}</div>
        </Col>
        <Col span={8}>
          <div style={{ marginBottom: 8 }}>{t('dashboard:query.time')}</div>
        </Col>
      </Row>

      <Row gutter={10}>
        {indexType === 'index' && (
          <Col span={8}>
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                const index = getFieldValue(['targets', ...prefixNameField, 'query', 'index']);
                return <DateField datasourceValue={datasourceValue} index={index} prefixField={prefixField} prefixNames={[...prefixNameField, 'query']} />;
              }}
            </Form.Item>
          </Col>
        )}
        <Col span={8}>
          <Input.Group>
            <span className='ant-input-group-addon'>{t('datasource:es.interval')}</span>
            <Form.Item {...prefixField} name={[...prefixNameField, 'query', 'interval']} noStyle>
              <InputNumber style={{ width: '100%' }} placeholder='auto' />
            </Form.Item>
            <span className='ant-input-group-addon'>
              <Form.Item {...prefixField} name={[...prefixNameField, 'query', 'interval_unit']} noStyle initialValue='min'>
                <Select>
                  <Select.Option value='second'>{t('common:time.second')}</Select.Option>
                  <Select.Option value='min'>{t('common:time.minute')}</Select.Option>
                  <Select.Option value='hour'>{t('common:time.hour')}</Select.Option>
                </Select>
              </Form.Item>
            </span>
          </Input.Group>
        </Col>
        <Col span={8}>
          <Form.Item
            {...prefixField}
            name={[...prefixNameField, 'time']}
            tooltip={{
              getPopupContainer: () => document.body,
              title: t('query.time_tip'),
            }}
            normalize={(val) => {
              if (val === undefined || val === null || val === '') return undefined;
              return {
                start: isMathString(val.start) ? val.start : moment(val.start).format('YYYY-MM-DD HH:mm:ss'),
                end: isMathString(val.end) ? val.end : moment(val.end).format('YYYY-MM-DD HH:mm:ss'),
              };
            }}
          >
            <TimeRangePicker
              dateFormat='YYYY-MM-DD HH:mm:ss'
              allowClear
              onClear={() => {
                const targets = chartForm.getFieldValue('targets');
                const targetsClone = _.cloneDeep(targets);
                _.set(targetsClone, [...prefixNameField, 'time'], undefined);
                chartForm.setFieldsValue({
                  targets: targetsClone,
                });
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
